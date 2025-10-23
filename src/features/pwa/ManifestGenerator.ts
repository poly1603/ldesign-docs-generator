/**
 * PWA Manifest 生成器
 * 生成 Web App Manifest 和 Service Worker
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import type { Logger } from '../../types'

/**
 * PWA 配置
 */
export interface PWAConfig {
  /** 是否启用 PWA */
  enabled?: boolean
  /** 应用名称 */
  name: string
  /** 应用短名称 */
  shortName?: string
  /** 应用描述 */
  description?: string
  /** 主题颜色 */
  themeColor?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 图标列表 */
  icons?: Array<{
    src: string
    sizes: string
    type?: string
    purpose?: string
  }>
  /** Service Worker 配置 */
  serviceWorker?: ServiceWorkerConfig
}

/**
 * Service Worker 配置
 */
export interface ServiceWorkerConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 缓存策略 */
  cacheStrategy?: 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate'
  /** 缓存名称 */
  cacheName?: string
  /** 要缓存的文件模式 */
  cachePatterns?: string[]
  /** 运行时缓存 */
  runtimeCaching?: RuntimeCachingRule[]
}

/**
 * 运行时缓存规则
 */
export interface RuntimeCachingRule {
  urlPattern: string
  handler: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate'
  options?: {
    cacheName?: string
    expiration?: {
      maxEntries?: number
      maxAgeSeconds?: number
    }
  }
}

/**
 * Manifest Generator
 */
export class ManifestGenerator {
  private config: PWAConfig
  private logger: Logger

  constructor(config: PWAConfig, logger: Logger) {
    this.config = config
    this.logger = logger
  }

  /**
   * 生成 manifest.json
   */
  async generateManifest(outputDir: string): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    const manifest = {
      name: this.config.name,
      short_name: this.config.shortName || this.config.name,
      description: this.config.description || '',
      start_url: '/',
      display: 'standalone',
      theme_color: this.config.themeColor || '#42b983',
      background_color: this.config.backgroundColor || '#ffffff',
      icons: this.config.icons || [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    }

    const manifestPath = path.join(outputDir, 'manifest.json')
    await fs.writeJson(manifestPath, manifest, { spaces: 2 })

    this.logger.info(`已生成 manifest.json: ${manifestPath}`)
  }

  /**
   * 生成 Service Worker
   */
  async generateServiceWorker(outputDir: string): Promise<void> {
    if (!this.config.enabled || !this.config.serviceWorker?.enabled) {
      return
    }

    const swConfig = this.config.serviceWorker

    const swCode = `
// Service Worker - 自动生成
const CACHE_NAME = '${swConfig.cacheName || 'ldesign-docs-v1'}'
const urlsToCache = ${JSON.stringify(swConfig.cachePatterns || [
      '/',
      '/index.html',
      '/assets/css/main.css',
      '/assets/js/main.js',
    ])}

// 安装事件
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('已打开缓存')
        return cache.addAll(urlsToCache)
      })
  )
  self.skipWaiting()
})

// 激活事件
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// 请求拦截
self.addEventListener('fetch', (event) => {
  const strategy = '${swConfig.cacheStrategy || 'networkFirst'}'
  
  if (strategy === 'cacheFirst') {
    event.respondWith(cacheFirst(event.request))
  } else if (strategy === 'networkFirst') {
    event.respondWith(networkFirst(event.request))
  } else {
    event.respondWith(staleWhileRevalidate(event.request))
  }
})

// 缓存优先策略
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, response.clone())
    return response
  } catch (error) {
    console.error('Fetch 失败:', error)
    throw error
  }
}

// 网络优先策略
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, response.clone())
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

// 陈旧内容重新验证策略
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)
  const fetchPromise = fetch(request).then((response) => {
    const cache = caches.open(CACHE_NAME)
    cache.then((c) => c.put(request, response.clone()))
    return response
  })
  
  return cached || fetchPromise
}

// 运行时缓存
${this.generateRuntimeCaching(swConfig.runtimeCaching)}
`

    const swPath = path.join(outputDir, 'sw.js')
    await fs.writeFile(swPath, swCode.trim(), 'utf-8')

    this.logger.info(`已生成 Service Worker: ${swPath}`)
  }

  /**
   * 生成运行时缓存代码
   */
  private generateRuntimeCaching(rules?: RuntimeCachingRule[]): string {
    if (!rules || rules.length === 0) {
      return ''
    }

    return `
// 运行时缓存规则
const runtimeCachingRules = ${JSON.stringify(rules, null, 2)}

// 应用运行时缓存
self.addEventListener('fetch', (event) => {
  for (const rule of runtimeCachingRules) {
    const regex = new RegExp(rule.urlPattern)
    if (regex.test(event.request.url)) {
      event.respondWith(handleRuntimeCaching(event.request, rule))
      return
    }
  }
})

async function handleRuntimeCaching(request, rule) {
  const cache = await caches.open(rule.options?.cacheName || CACHE_NAME)
  
  if (rule.handler === 'CacheFirst') {
    return cacheFirst(request, cache, rule.options)
  } else if (rule.handler === 'NetworkFirst') {
    return networkFirst(request, cache, rule.options)
  } else {
    return staleWhileRevalidate(request, cache, rule.options)
  }
}
`
  }

  /**
   * 生成 PWA 注册脚本
   */
  generateRegistrationScript(): string {
    return `
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker 注册成功:', registration.scope)
      })
      .catch((error) => {
        console.error('Service Worker 注册失败:', error)
      })
  })
}
</script>
`
  }
}

/**
 * 创建 Manifest 生成器
 */
export function createManifestGenerator(config: PWAConfig, logger: Logger): ManifestGenerator {
  return new ManifestGenerator(config, logger)
}


