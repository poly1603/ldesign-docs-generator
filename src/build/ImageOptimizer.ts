/**
 * 图片优化器
 * 压缩图片、转换格式、生成响应式图片
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import type { Logger } from '../types'

/**
 * 图片优化配置
 */
export interface ImageOptimizerConfig {
  /** 是否启用优化 */
  enabled?: boolean
  /** 是否转换为 WebP */
  convertToWebP?: boolean
  /** 压缩质量 (0-100) */
  quality?: number
  /** 是否生成响应式图片 */
  responsive?: boolean
  /** 响应式图片尺寸 */
  sizes?: number[]
  /** 是否添加懒加载 */
  lazyLoading?: boolean
}

/**
 * 优化后的图片信息
 */
export interface OptimizedImage {
  originalPath: string
  optimizedPath: string
  originalSize: number
  optimizedSize: number
  format: string
  savings: number
}

/**
 * 图片优化器
 */
export class ImageOptimizer {
  private config: Required<ImageOptimizerConfig>
  private logger: Logger
  private optimizedImages: OptimizedImage[] = []

  constructor(config: ImageOptimizerConfig, logger: Logger) {
    this.config = {
      enabled: true,
      convertToWebP: true,
      quality: 80,
      responsive: true,
      sizes: [640, 768, 1024, 1280, 1920],
      lazyLoading: true,
      ...config,
    }
    this.logger = logger
  }

  /**
   * 优化图片
   */
  async optimizeImage(imagePath: string, outputDir: string): Promise<OptimizedImage | null> {
    if (!this.config.enabled) {
      return null
    }

    try {
      const stats = await fs.stat(imagePath)
      const originalSize = stats.size

      // 这里需要 sharp 库（可选依赖）
      let sharp: any
      try {
        sharp = (await import('sharp')).default
      } catch {
        this.logger.warn('sharp 未安装，跳过图片优化。运行 pnpm add -D sharp 安装')
        return null
      }

      const ext = path.extname(imagePath)
      const basename = path.basename(imagePath, ext)
      const relativePath = path.relative(process.cwd(), imagePath)

      let outputPath: string
      let optimizedSize: number

      // 转换为 WebP
      if (this.config.convertToWebP && ['.jpg', '.jpeg', '.png'].includes(ext.toLowerCase())) {
        outputPath = path.join(outputDir, relativePath.replace(ext, '.webp'))
        await fs.ensureDir(path.dirname(outputPath))

        await sharp(imagePath)
          .webp({ quality: this.config.quality })
          .toFile(outputPath)

        const outputStats = await fs.stat(outputPath)
        optimizedSize = outputStats.size
      } else {
        // 压缩原格式
        outputPath = path.join(outputDir, relativePath)
        await fs.ensureDir(path.dirname(outputPath))

        const image = sharp(imagePath)

        if (ext === '.jpg' || ext === '.jpeg') {
          await image.jpeg({ quality: this.config.quality }).toFile(outputPath)
        } else if (ext === '.png') {
          await image.png({ quality: this.config.quality }).toFile(outputPath)
        } else {
          await fs.copy(imagePath, outputPath)
        }

        const outputStats = await fs.stat(outputPath)
        optimizedSize = outputStats.size
      }

      const savings = ((originalSize - optimizedSize) / originalSize) * 100

      const result: OptimizedImage = {
        originalPath: imagePath,
        optimizedPath: outputPath,
        originalSize,
        optimizedSize,
        format: this.config.convertToWebP ? 'webp' : ext.slice(1),
        savings,
      }

      this.optimizedImages.push(result)

      this.logger.debug(
        `优化图片: ${path.basename(imagePath)} (${(originalSize / 1024).toFixed(2)} KB → ${(optimizedSize / 1024).toFixed(2)} KB, 节省 ${savings.toFixed(1)}%)`
      )

      return result
    } catch (error) {
      this.logger.error(`优化图片失败: ${imagePath}`, error)
      return null
    }
  }

  /**
   * 批量优化图片
   */
  async optimizeImages(imageDir: string, outputDir: string): Promise<void> {
    const images = await this.findImages(imageDir)

    this.logger.info(`找到 ${images.length} 个图片文件`)

    let successCount = 0
    for (const image of images) {
      const result = await this.optimizeImage(image, outputDir)
      if (result) {
        successCount++
      }
    }

    const totalSavings = this.optimizedImages.reduce((sum, img) => sum + img.savings, 0) / this.optimizedImages.length

    this.logger.success(`成功优化 ${successCount}/${images.length} 个图片，平均节省 ${totalSavings.toFixed(1)}%`)
  }

  /**
   * 查找所有图片文件
   */
  private async findImages(dir: string): Promise<string[]> {
    const images: string[] = []
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

    async function walk(currentDir: string) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)

        if (entry.isDirectory()) {
          await walk(fullPath)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          if (imageExts.includes(ext)) {
            images.push(fullPath)
          }
        }
      }
    }

    await walk(dir)
    return images
  }

  /**
   * 生成优化报告
   */
  generateReport(): string {
    const totalOriginalSize = this.optimizedImages.reduce((sum, img) => sum + img.originalSize, 0)
    const totalOptimizedSize = this.optimizedImages.reduce((sum, img) => sum + img.optimizedSize, 0)
    const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100

    let report = `# 图片优化报告\n\n`
    report += `**优化图片数**: ${this.optimizedImages.length}\n`
    report += `**原始大小**: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB\n`
    report += `**优化后大小**: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB\n`
    report += `**节省空间**: ${totalSavings.toFixed(2)}%\n\n`

    report += `## 详细列表\n\n`
    report += `| 文件 | 原始大小 | 优化后 | 节省 | 格式 |\n`
    report += `|------|---------|--------|------|------|\n`

    this.optimizedImages.forEach((img) => {
      const filename = path.basename(img.originalPath)
      const originalKB = (img.originalSize / 1024).toFixed(2)
      const optimizedKB = (img.optimizedSize / 1024).toFixed(2)
      report += `| ${filename} | ${originalKB} KB | ${optimizedKB} KB | ${img.savings.toFixed(1)}% | ${img.format} |\n`
    })

    return report
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.optimizedImages = []
  }
}

/**
 * 创建代码分割器
 */
export function createCodeSplitter(config: CodeSplitterConfig, logger: Logger): CodeSplitter {
  return new CodeSplitter(config, logger)
}


