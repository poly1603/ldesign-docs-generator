/**
 * 代码分割器
 * 实现路由级代码分割和组件懒加载
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import type { Logger } from '../types'

/**
 * 代码分割配置
 */
export interface CodeSplitterConfig {
  /** 是否启用代码分割 */
  enabled?: boolean
  /** 代码块大小阈值（KB）*/
  chunkSizeThreshold?: number
  /** 手动分割的代码块 */
  manualChunks?: Record<string, string[]>
  /** 是否分割 vendor */
  splitVendor?: boolean
}

/**
 * 代码块信息
 */
export interface ChunkInfo {
  name: string
  size: number
  modules: string[]
  dependencies: string[]
}

/**
 * 代码分割器
 */
export class CodeSplitter {
  private config: CodeSplitterConfig
  private logger: Logger
  private chunks: Map<string, ChunkInfo> = new Map()

  constructor(config: CodeSplitterConfig, logger: Logger) {
    this.config = {
      enabled: true,
      chunkSizeThreshold: 500, // 500KB
      splitVendor: true,
      ...config,
    }
    this.logger = logger
  }

  /**
   * 获取 Vite 构建配置中的代码分割设置
   */
  getViteBuildConfig(): any {
    if (!this.config.enabled) {
      return {}
    }

    return {
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            // 手动分割配置
            if (this.config.manualChunks) {
              for (const [chunkName, modules] of Object.entries(this.config.manualChunks)) {
                if (modules.some((mod) => id.includes(mod))) {
                  return chunkName
                }
              }
            }

            // 分割 node_modules（vendor）
            if (this.config.splitVendor && id.includes('node_modules')) {
              // Vue 相关
              if (id.includes('vue') || id.includes('@vue')) {
                return 'vendor-vue'
              }

              // Markdown 相关
              if (id.includes('markdown-it') || id.includes('shiki')) {
                return 'vendor-markdown'
              }

              // 其他依赖
              return 'vendor'
            }

            // 按路由分割
            if (id.includes('/pages/') || id.includes('/docs/')) {
              const match = id.match(/\/pages\/([^/]+)/)
              if (match) {
                return `page-${match[1]}`
              }
            }

            return undefined
          },
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name
            return `assets/js/${name}-[hash].js`
          },
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || ''

            // CSS 文件
            if (name.endsWith('.css')) {
              return 'assets/css/[name]-[hash][extname]'
            }

            // 图片
            if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(name)) {
              return 'assets/images/[name]-[hash][extname]'
            }

            // 字体
            if (/\.(woff2?|eot|ttf|otf)$/.test(name)) {
              return 'assets/fonts/[name]-[hash][extname]'
            }

            return 'assets/[name]-[hash][extname]'
          },
        },
      },
    }
  }

  /**
   * 分析代码块
   */
  async analyzeChunks(buildOutputDir: string): Promise<ChunkInfo[]> {
    const chunks: ChunkInfo[] = []

    try {
      const statsFile = path.join(buildOutputDir, 'stats.json')
      if (await fs.pathExists(statsFile)) {
        const stats = await fs.readJson(statsFile)

        // 解析代码块信息
        if (stats.chunks) {
          for (const chunk of stats.chunks) {
            chunks.push({
              name: chunk.name || chunk.id,
              size: chunk.size || 0,
              modules: chunk.modules || [],
              dependencies: chunk.dependencies || [],
            })
          }
        }
      }

      // 按大小排序
      chunks.sort((a, b) => b.size - a.size)

      // 记录大代码块警告
      chunks.forEach((chunk) => {
        const sizeKB = chunk.size / 1024
        if (sizeKB > this.config.chunkSizeThreshold!) {
          this.logger.warn(`代码块 "${chunk.name}" 过大: ${sizeKB.toFixed(2)} KB`)
        }
      })
    } catch (error) {
      this.logger.error('分析代码块失败:', error)
    }

    return chunks
  }

  /**
   * 生成代码分割报告
   */
  generateReport(chunks: ChunkInfo[]): string {
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
    const totalSizeKB = (totalSize / 1024).toFixed(2)

    let report = `# 代码分割报告\n\n`
    report += `**总大小**: ${totalSizeKB} KB\n\n`
    report += `**代码块数量**: ${chunks.length}\n\n`
    report += `## 代码块列表\n\n`
    report += `| 名称 | 大小 | 模块数 |\n`
    report += `|------|------|--------|\n`

    chunks.forEach((chunk) => {
      const sizeKB = (chunk.size / 1024).toFixed(2)
      report += `| ${chunk.name} | ${sizeKB} KB | ${chunk.modules.length} |\n`
    })

    return report
  }
}

/**
 * 创建代码分割器
 */
export function createCodeSplitter(config: CodeSplitterConfig, logger: Logger): CodeSplitter {
  return new CodeSplitter(config, logger)
}


