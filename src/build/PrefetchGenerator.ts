/**
 * 预取生成器
 * 生成预加载和预取链接以优化性能
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import type { Logger } from '../types'

/**
 * 预取配置
 */
export interface PrefetchConfig {
  /** 是否启用预取 */
  enabled?: boolean
  /** 是否预加载关键资源 */
  preload?: boolean
  /** 是否预取相邻页面 */
  prefetchPages?: boolean
  /** 预取策略 */
  strategy?: 'eager' | 'lazy' | 'viewport'
}

/**
 * 资源类型
 */
export type ResourceType = 'style' | 'script' | 'font' | 'image' | 'document'

/**
 * 预取资源
 */
export interface PrefetchResource {
  href: string
  type: ResourceType
  as?: string
  crossorigin?: string
}

/**
 * 预取生成器
 */
export class PrefetchGenerator {
  private config: Required<PrefetchConfig>
  private logger: Logger

  constructor(config: PrefetchConfig, logger: Logger) {
    this.config = {
      enabled: true,
      preload: true,
      prefetchPages: true,
      strategy: 'lazy',
      ...config,
    }
    this.logger = logger
  }

  /**
   * 生成预加载链接标签
   */
  generatePreloadLinks(resources: PrefetchResource[]): string[] {
    if (!this.config.preload) {
      return []
    }

    return resources.map((resource) => {
      let attrs = `rel="preload" href="${resource.href}"`

      if (resource.as) {
        attrs += ` as="${resource.as}"`
      }

      if (resource.crossorigin) {
        attrs += ` crossorigin="${resource.crossorigin}"`
      }

      return `<link ${attrs}>`
    })
  }

  /**
   * 生成预取链接标签
   */
  generatePrefetchLinks(pages: string[]): string[] {
    if (!this.config.prefetchPages) {
      return []
    }

    return pages.map((page) => {
      return `<link rel="prefetch" href="${page}">`
    })
  }

  /**
   * 生成 DNS 预取
   */
  generateDnsPrefetch(domains: string[]): string[] {
    return domains.map((domain) => {
      return `<link rel="dns-prefetch" href="${domain}">`
    })
  }

  /**
   * 生成预连接
   */
  generatePreconnect(origins: string[]): string[] {
    return origins.map((origin) => {
      return `<link rel="preconnect" href="${origin}" crossorigin>`
    })
  }

  /**
   * 为页面注入预取脚本
   */
  generatePrefetchScript(): string {
    if (this.config.strategy === 'eager') {
      // 立即预取
      return `
<script>
(function() {
  const links = document.querySelectorAll('a[href]')
  links.forEach(link => {
    const href = link.getAttribute('href')
    if (href && !href.startsWith('#') && !href.startsWith('http')) {
      const prefetchLink = document.createElement('link')
      prefetchLink.rel = 'prefetch'
      prefetchLink.href = href
      document.head.appendChild(prefetchLink)
    }
  })
})()
</script>`
    } else if (this.config.strategy === 'viewport') {
      // 在视口中时预取
      return `
<script>
(function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const link = entry.target
        const href = link.getAttribute('href')
        if (href && !href.startsWith('#') && !href.startsWith('http')) {
          const prefetchLink = document.createElement('link')
          prefetchLink.rel = 'prefetch'
          prefetchLink.href = href
          document.head.appendChild(prefetchLink)
          observer.unobserve(link)
        }
      }
    })
  })

  document.querySelectorAll('a[href]').forEach(link => {
    observer.observe(link)
  })
})()
</script>`
    } else {
      // 懒加载：鼠标悬停时预取
      return `
<script>
(function() {
  const prefetched = new Set()
  
  document.addEventListener('mouseover', (e) => {
    const link = e.target.closest('a[href]')
    if (!link) return
    
    const href = link.getAttribute('href')
    if (!href || href.startsWith('#') || href.startsWith('http') || prefetched.has(href)) {
      return
    }
    
    prefetched.add(href)
    const prefetchLink = document.createElement('link')
    prefetchLink.rel = 'prefetch'
    prefetchLink.href = href
    document.head.appendChild(prefetchLink)
  })
})()
</script>`
    }
  }

  /**
   * 分析页面的关键资源
   */
  async analyzePageResources(htmlPath: string): Promise<PrefetchResource[]> {
    const resources: PrefetchResource[] = []

    try {
      const html = await fs.readFile(htmlPath, 'utf-8')

      // 提取 CSS
      const cssMatches = html.matchAll(/<link[^>]+href="([^"]+\.css)"[^>]*>/g)
      for (const match of cssMatches) {
        resources.push({ href: match[1], type: 'style', as: 'style' })
      }

      // 提取 JavaScript
      const jsMatches = html.matchAll(/<script[^>]+src="([^"]+\.js)"[^>]*>/g)
      for (const match of jsMatches) {
        resources.push({ href: match[1], type: 'script', as: 'script' })
      }

      // 提取字体
      const fontMatches = html.matchAll(/url\(["']?([^"')]+\.(woff2?|ttf|eot))["']?\)/g)
      for (const match of fontMatches) {
        resources.push({ href: match[1], type: 'font', as: 'font', crossorigin: 'anonymous' })
      }

      this.logger.debug(`分析页面资源: ${htmlPath} (${resources.length} 个资源)`)
    } catch (error) {
      this.logger.error(`分析页面资源失败: ${htmlPath}`, error)
    }

    return resources
  }

  /**
   * 注入预取链接到 HTML
   */
  async injectPrefetchLinks(htmlPath: string, links: string[]): Promise<void> {
    try {
      let html = await fs.readFile(htmlPath, 'utf-8')

      // 在 </head> 前插入预取链接
      const headEndIndex = html.indexOf('</head>')
      if (headEndIndex !== -1) {
        const linksHtml = '\n  ' + links.join('\n  ') + '\n'
        html = html.slice(0, headEndIndex) + linksHtml + html.slice(headEndIndex)
        await fs.writeFile(htmlPath, html, 'utf-8')
      }
    } catch (error) {
      this.logger.error(`注入预取链接失败: ${htmlPath}`, error)
    }
  }
}

/**
 * 创建预取生成器
 */
export function createPrefetchGenerator(config: PrefetchConfig, logger: Logger): PrefetchGenerator {
  return new PrefetchGenerator(config, logger)
}


