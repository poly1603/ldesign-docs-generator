/**
 * Critical CSS 提取器
 * 提取首屏关键 CSS 并内联到 HTML 中
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import type { Logger } from '../types'

/**
 * Critical CSS 配置
 */
export interface CriticalCssConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 视口宽度 */
  width?: number
  /** 视口高度 */
  height?: number
  /** 是否内联关键 CSS */
  inline?: boolean
  /** 最小化 CSS */
  minify?: boolean
}

/**
 * Critical CSS 提取器
 */
export class CriticalCssExtractor {
  private config: Required<CriticalCssConfig>
  private logger: Logger

  constructor(config: CriticalCssConfig, logger: Logger) {
    this.config = {
      enabled: true,
      width: 1300,
      height: 900,
      inline: true,
      minify: true,
      ...config,
    }
    this.logger = logger
  }

  /**
   * 提取关键 CSS
   * 注意：这是一个简化版本，实际生产环境建议使用 critical 或 critters 库
   */
  async extractCritical(htmlPath: string, cssPath: string): Promise<string> {
    if (!this.config.enabled) {
      return ''
    }

    try {
      const html = await fs.readFile(htmlPath, 'utf-8')
      const css = await fs.readFile(cssPath, 'utf-8')

      // 简单的关键 CSS 提取逻辑
      // 实际应该使用 puppeteer 或 JSDOM 来计算首屏元素
      const criticalSelectors = this.extractCriticalSelectors(html)
      const criticalCss = this.filterCssBySelectors(css, criticalSelectors)

      if (this.config.minify) {
        return this.minifyCss(criticalCss)
      }

      return criticalCss
    } catch (error) {
      this.logger.error('提取关键 CSS 失败:', error)
      return ''
    }
  }

  /**
   * 提取关键选择器（简化版）
   */
  private extractCriticalSelectors(html: string): Set<string> {
    const selectors = new Set<string>()

    // 提取 class
    const classMatches = html.matchAll(/class="([^"]+)"/g)
    for (const match of classMatches) {
      match[1].split(/\s+/).forEach((cls) => {
        if (cls) selectors.add(`.${cls}`)
      })
    }

    // 提取 id
    const idMatches = html.matchAll(/id="([^"]+)"/g)
    for (const match of idMatches) {
      selectors.add(`#${match[1]}`)
    }

    // 添加常见的关键元素选择器
    const criticalElements = ['html', 'body', 'header', 'nav', 'main', 'footer', 'h1', 'h2', 'p', 'a']
    criticalElements.forEach((el) => selectors.add(el))

    return selectors
  }

  /**
   * 根据选择器过滤 CSS
   */
  private filterCssBySelectors(css: string, selectors: Set<string>): string {
    const rules: string[] = []

    // 简化的 CSS 解析（实际应该使用 postcss）
    const ruleRegex = /([^{]+)\{([^}]+)\}/g
    let match

    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim()
      const declaration = match[2].trim()

      // 检查选择器是否匹配
      const selectorParts = selector.split(/[,\s]+/)
      const hasMatch = selectorParts.some((part) => {
        const cleanPart = part.replace(/::?[\w-]+/g, '') // 移除伪类/伪元素
        return selectors.has(cleanPart) ||
          Array.from(selectors).some(s => cleanPart.includes(s))
      })

      if (hasMatch) {
        rules.push(`${selector} { ${declaration} }`)
      }
    }

    return rules.join('\n')
  }

  /**
   * 最小化 CSS
   */
  private minifyCss(css: string): string {
    return css
      .replace(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, '') // 移除注释
      .replace(/\s+/g, ' ') // 压缩空白
      .replace(/\s*([{}:;,])\s*/g, '$1') // 移除符号周围的空白
      .trim()
  }

  /**
   * 内联关键 CSS 到 HTML
   */
  async inlineCriticalCss(htmlPath: string, criticalCss: string): Promise<void> {
    if (!this.config.inline || !criticalCss) {
      return
    }

    try {
      let html = await fs.readFile(htmlPath, 'utf-8')

      // 在 </head> 前插入内联样式
      const headEndIndex = html.indexOf('</head>')
      if (headEndIndex !== -1) {
        const styleTag = `\n  <style>${criticalCss}</style>\n`
        html = html.slice(0, headEndIndex) + styleTag + html.slice(headEndIndex)
        await fs.writeFile(htmlPath, html, 'utf-8')

        this.logger.debug(`已内联关键 CSS: ${htmlPath} (${criticalCss.length} 字节)`)
      }
    } catch (error) {
      this.logger.error(`内联关键 CSS 失败: ${htmlPath}`, error)
    }
  }

  /**
   * 延迟加载非关键 CSS
   */
  async deferNonCriticalCss(htmlPath: string): Promise<void> {
    try {
      let html = await fs.readFile(htmlPath, 'utf-8')

      // 将 <link rel="stylesheet"> 改为延迟加载
      html = html.replace(
        /<link\s+rel="stylesheet"\s+href="([^"]+)"\s*\/?>/g,
        (match, href) => {
          return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="${href}"></noscript>`
        }
      )

      await fs.writeFile(htmlPath, html, 'utf-8')

      this.logger.debug(`已设置 CSS 延迟加载: ${htmlPath}`)
    } catch (error) {
      this.logger.error(`设置 CSS 延迟加载失败: ${htmlPath}`, error)
    }
  }
}

/**
 * 创建预取生成器
 */
export function createPrefetchGenerator(config: PrefetchConfig, logger: Logger): PrefetchGenerator {
  return new PrefetchGenerator(config, logger)
}


