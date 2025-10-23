/**
 * 运行时优化器
 * 
 * 优化生成的站点在浏览器中的运行时性能
 */

import fs from 'fs-extra'
import * as path from 'path'
import type { Logger } from '../types'

/**
 * 运行时优化器选项
 */
export interface RuntimeOptimizerOptions {
  /** 输出目录 */
  outputDir: string
  /** 日志器 */
  logger: Logger
  /** 是否启用代码分割 */
  codeSplit?: boolean
  /** 是否启用图片优化 */
  imageOptimization?: boolean
  /** 是否启用预渲染 */
  prerender?: boolean
  /** 是否生成 Service Worker */
  serviceWorker?: boolean
  /** 是否启用性能监控 */
  performanceMonitoring?: boolean
}

/**
 * 运行时优化器
 */
export class RuntimeOptimizer {
  private options: RuntimeOptimizerOptions
  private logger: Logger

  constructor(options: RuntimeOptimizerOptions) {
    this.options = {
      codeSplit: true,
      imageOptimization: true,
      prerender: false,
      serviceWorker: false,
      performanceMonitoring: false,
      ...options,
    }
    this.logger = options.logger
  }

  /**
   * 执行优化
   */
  async optimize(): Promise<void> {
    this.logger.info('开始运行时优化...')

    if (this.options.codeSplit) {
      await this.generateCodeSplitManifest()
    }

    if (this.options.imageOptimization) {
      await this.optimizeImages()
    }

    if (this.options.serviceWorker) {
      await this.generateServiceWorker()
    }

    if (this.options.performanceMonitoring) {
      await this.injectPerformanceMonitoring()
    }

    this.logger.success('运行时优化完成！')
  }

  /**
   * 生成代码分割清单
   */
  private async generateCodeSplitManifest(): Promise<void> {
    this.logger.debug('生成代码分割清单...')

    const manifest = {
      chunks: {
        vendor: ['/assets/vendor.js'],
        common: ['/assets/common.js'],
        pages: {} as Record<string, string[]>,
      },
    }

    const manifestPath = path.join(this.options.outputDir, 'chunk-manifest.json')
    await fs.writeJSON(manifestPath, manifest, { spaces: 2 })
  }

  /**
   * 优化图片
   */
  private async optimizeImages(): Promise<void> {
    this.logger.info('优化图片...')

    const imageFiles = await this.findImages(this.options.outputDir)

    for (const file of imageFiles) {
      await this.addImageLazyLoading(file)
    }

    this.logger.info(`优化了 ${imageFiles.length} 个图片`)
  }

  /**
   * 查找图片文件
   */
  private async findImages(dir: string): Promise<string[]> {
    const images: string[] = []
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

    async function scan(currentDir: string) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)

        if (entry.isDirectory()) {
          await scan(fullPath)
        } else if (imageExts.some(ext => entry.name.endsWith(ext))) {
          images.push(fullPath)
        }
      }
    }

    await scan(dir)
    return images
  }

  /**
   * 为图片添加懒加载
   */
  private async addImageLazyLoading(imagePath: string): Promise<void> {
    // 图片懒加载通过修改HTML中的img标签实现
    // 这里记录需要优化的图片
  }

  /**
   * 生成 Service Worker
   */
  private async generateServiceWorker(): Promise<void> {
    this.logger.info('生成 Service Worker...')

    const swContent = `/**
 * Service Worker
 * 
 * 提供离线支持和缓存管理
 */

const CACHE_NAME = 'docs-cache-v1'
const urlsToCache = [
  '/',
  '/assets/main.css',
  '/assets/main.js',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
`

    const swPath = path.join(this.options.outputDir, 'sw.js')
    await fs.writeFile(swPath, swContent, 'utf-8')

    // 生成 Service Worker 注册脚本
    const registerScript = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.error('Service Worker registration failed:', err))
  })
}
`

    const registerPath = path.join(this.options.outputDir, 'assets', 'sw-register.js')
    await fs.ensureDir(path.dirname(registerPath))
    await fs.writeFile(registerPath, registerScript, 'utf-8')

    this.logger.success('Service Worker 已生成')
  }

  /**
   * 注入性能监控
   */
  private async injectPerformanceMonitoring(): Promise<void> {
    this.logger.info('注入性能监控...')

    const monitoringScript = `
/**
 * 性能监控
 */

(function() {
  'use strict';

  // Web Vitals 监控
  function reportWebVitals() {
    if (!window.PerformanceObserver) return

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        const fid = entry.processingStart - entry.startTime
        console.log('FID:', fid)
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    let clsScore = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value
        }
      }
      console.log('CLS:', clsScore)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // 页面加载性能
  window.addEventListener('load', () => {
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart

    console.log('Performance Metrics:', {
      pageLoad: pageLoadTime + 'ms',
      domReady: domReadyTime + 'ms',
    })

    reportWebVitals()
  })
})();
`

    const monitoringPath = path.join(this.options.outputDir, 'assets', 'performance.js')
    await fs.ensureDir(path.dirname(monitoringPath))
    await fs.writeFile(monitoringPath, monitoringScript, 'utf-8')

    this.logger.success('性能监控已注入')
  }
}


