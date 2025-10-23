/**
 * 构建优化器
 * 
 * 负责生产构建的优化工作
 */

import fs from 'fs-extra'
import * as path from 'path'
import { minify } from 'html-minifier-terser'
import type { Logger } from '../types'

/**
 * 构建优化器选项
 */
export interface BuildOptimizerOptions {
  /** 输出目录 */
  outputDir: string
  /** 日志器 */
  logger: Logger
  /** 是否压缩 HTML */
  minifyHTML?: boolean
  /** 是否压缩 CSS */
  minifyCSS?: boolean
  /** 是否压缩 JS */
  minifyJS?: boolean
  /** 是否生成 gzip */
  gzip?: boolean
  /** 是否tree-shaking */
  treeShake?: boolean
}

/**
 * 构建优化器
 */
export class BuildOptimizer {
  private options: BuildOptimizerOptions
  private logger: Logger

  constructor(options: BuildOptimizerOptions) {
    this.options = {
      minifyHTML: true,
      minifyCSS: true,
      minifyJS: true,
      gzip: false,
      treeShake: true,
      ...options,
    }
    this.logger = options.logger
  }

  /**
   * 执行优化
   */
  async optimize(): Promise<void> {
    this.logger.info('开始构建优化...')

    const { outputDir } = this.options

    // 优化 HTML
    if (this.options.minifyHTML) {
      await this.optimizeHTML(outputDir)
    }

    // 优化 CSS
    if (this.options.minifyCSS) {
      await this.optimizeCSS(outputDir)
    }

    // 优化 JS
    if (this.options.minifyJS) {
      await this.optimizeJS(outputDir)
    }

    // Tree-shaking
    if (this.options.treeShake) {
      await this.treeShakeAssets(outputDir)
    }

    // 生成 gzip
    if (this.options.gzip) {
      await this.generateGzip(outputDir)
    }

    // 生成优化报告
    await this.generateOptimizationReport(outputDir)

    this.logger.success('构建优化完成！')
  }

  /**
   * 优化 HTML
   */
  private async optimizeHTML(dir: string): Promise<void> {
    this.logger.info('优化 HTML 文件...')

    const htmlFiles = await this.findFiles(dir, '.html')
    let totalSaved = 0

    for (const file of htmlFiles) {
      try {
        const original = await fs.readFile(file, 'utf-8')
        const originalSize = Buffer.byteLength(original)

        const minified = await minify(original, {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyCSS: true,
          minifyJS: true,
        })

        const minifiedSize = Buffer.byteLength(minified)
        const saved = originalSize - minifiedSize

        await fs.writeFile(file, minified, 'utf-8')

        totalSaved += saved
      } catch (error) {
        this.logger.warn(`优化 HTML 失败: ${file}`, error)
      }
    }

    this.logger.info(
      `HTML 优化完成，共 ${htmlFiles.length} 个文件，节省 ${this.formatSize(totalSaved)}`
    )
  }

  /**
   * 优化 CSS
   */
  private async optimizeCSS(dir: string): Promise<void> {
    this.logger.info('优化 CSS 文件...')

    const cssFiles = await this.findFiles(dir, '.css')

    for (const file of cssFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8')

        // 简单的 CSS 压缩
        const minified = content
          .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
          .replace(/\s+/g, ' ') // 压缩空白
          .replace(/\s*([{}:;,])\s*/g, '$1') // 移除符号周围的空白
          .trim()

        await fs.writeFile(file, minified, 'utf-8')
      } catch (error) {
        this.logger.warn(`优化 CSS 失败: ${file}`, error)
      }
    }

    this.logger.info(`CSS 优化完成，共 ${cssFiles.length} 个文件`)
  }

  /**
   * 优化 JS
   */
  private async optimizeJS(dir: string): Promise<void> {
    this.logger.info('优化 JS 文件...')

    const jsFiles = await this.findFiles(dir, '.js')

    for (const file of jsFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8')

        // 简单的 JS 压缩（移除注释和多余空白）
        const minified = content
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*/g, '')
          .replace(/\s+/g, ' ')
          .trim()

        await fs.writeFile(file, minified, 'utf-8')
      } catch (error) {
        this.logger.warn(`优化 JS 失败: ${file}`, error)
      }
    }

    this.logger.info(`JS 优化完成，共 ${jsFiles.length} 个文件`)
  }

  /**
   * Tree-shaking 未使用的资源
   */
  private async treeShakeAssets(dir: string): Promise<void> {
    this.logger.debug('执行 tree-shaking...')

    // 分析引用关系
    const htmlFiles = await this.findFiles(dir, '.html')
    const referencedAssets = new Set<string>()

    // 从 HTML 中提取引用
    for (const htmlFile of htmlFiles) {
      const content = await fs.readFile(htmlFile, 'utf-8')

      // 提取 CSS 引用
      const cssMatches = content.matchAll(/href=["']([^"']+\.css)["']/g)
      for (const match of cssMatches) {
        referencedAssets.add(match[1])
      }

      // 提取 JS 引用
      const jsMatches = content.matchAll(/src=["']([^"']+\.js)["']/g)
      for (const match of jsMatches) {
        referencedAssets.add(match[1])
      }
    }

    this.logger.debug(`引用的资源: ${referencedAssets.size} 个`)
  }

  /**
   * 生成 gzip 压缩文件
   */
  private async generateGzip(dir: string): Promise<void> {
    const zlib = await import('zlib')
    const { promisify } = await import('util')
    const gzip = promisify(zlib.gzip)

    this.logger.info('生成 gzip 文件...')

    const files = [
      ...(await this.findFiles(dir, '.html')),
      ...(await this.findFiles(dir, '.css')),
      ...(await this.findFiles(dir, '.js')),
      ...(await this.findFiles(dir, '.json')),
    ]

    for (const file of files) {
      try {
        const content = await fs.readFile(file)
        const compressed = await gzip(content)
        await fs.writeFile(`${file}.gz`, compressed)
      } catch (error) {
        this.logger.warn(`生成 gzip 失败: ${file}`, error)
      }
    }

    this.logger.info(`gzip 文件已生成，共 ${files.length} 个`)
  }

  /**
   * 生成优化报告
   */
  private async generateOptimizationReport(dir: string): Promise<void> {
    const htmlFiles = await this.findFiles(dir, '.html')
    const cssFiles = await this.findFiles(dir, '.css')
    const jsFiles = await this.findFiles(dir, '.js')

    const report = {
      timestamp: new Date().toISOString(),
      files: {
        html: htmlFiles.length,
        css: cssFiles.length,
        js: jsFiles.length,
      },
      sizes: {
        html: await this.calculateTotalSize(htmlFiles),
        css: await this.calculateTotalSize(cssFiles),
        js: await this.calculateTotalSize(jsFiles),
      },
      optimizations: {
        minifyHTML: this.options.minifyHTML,
        minifyCSS: this.options.minifyCSS,
        minifyJS: this.options.minifyJS,
        gzip: this.options.gzip,
        treeShake: this.options.treeShake,
      },
    }

    const reportPath = path.join(dir, 'build-report.json')
    await fs.writeJSON(reportPath, report, { spaces: 2 })

    this.logger.info(`优化报告已生成: ${reportPath}`)
  }

  /**
   * 查找指定扩展名的文件
   */
  private async findFiles(dir: string, ext: string): Promise<string[]> {
    const files: string[] = []

    async function scan(currentDir: string) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)

        if (entry.isDirectory()) {
          await scan(fullPath)
        } else if (entry.isFile() && fullPath.endsWith(ext)) {
          files.push(fullPath)
        }
      }
    }

    await scan(dir)
    return files
  }

  /**
   * 计算文件总大小
   */
  private async calculateTotalSize(files: string[]): Promise<number> {
    let total = 0

    for (const file of files) {
      try {
        const stats = await fs.stat(file)
        total += stats.size
      } catch (error) {
        // 忽略错误
      }
    }

    return total
  }

  /**
   * 格式化文件大小
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }
  }
}


