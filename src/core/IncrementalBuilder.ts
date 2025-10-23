/**
 * 增量构建器
 * 
 * 只重新构建变化的部分
 */

import fs from 'fs-extra'
import * as path from 'path'
import type { Logger, DocNode } from '../types'
import { IncrementalParser } from '../parsers/IncrementalParser'

/**
 * 增量构建器选项
 */
export interface IncrementalBuilderOptions {
  /** 输出目录 */
  outputDir: string
  /** 缓存目录 */
  cacheDir: string
  /** 日志器 */
  logger: Logger
}

/**
 * 构建清单
 */
interface BuildManifest {
  /** 构建时间 */
  timestamp: string
  /** 文档节点映射 */
  docs: Record<string, {
    path: string
    outputPath: string
    hash: string
  }>
}

/**
 * 增量构建器
 */
export class IncrementalBuilder {
  private options: IncrementalBuilderOptions
  private logger: Logger
  private manifestPath: string
  private manifest: BuildManifest

  constructor(options: IncrementalBuilderOptions) {
    this.options = options
    this.logger = options.logger
    this.manifestPath = path.join(options.cacheDir, 'build-manifest.json')
    this.manifest = this.loadManifest()
  }

  /**
   * 检测需要重新构建的文档
   */
  async detectRebuildNeeded(docs: DocNode[]): Promise<{
    rebuild: DocNode[]
    skip: DocNode[]
  }> {
    const rebuild: DocNode[] = []
    const skip: DocNode[] = []

    for (const doc of docs) {
      const cached = this.manifest.docs[doc.path]

      if (!cached) {
        // 新文档
        rebuild.push(doc)
        continue
      }

      // 计算当前哈希
      const currentHash = await this.calculateDocHash(doc)

      if (currentHash !== cached.hash) {
        // 文档已变化
        rebuild.push(doc)
      } else {
        // 检查输出文件是否存在
        const outputExists = await fs.pathExists(
          path.join(this.options.outputDir, cached.outputPath)
        )

        if (!outputExists) {
          rebuild.push(doc)
        } else {
          skip.push(doc)
        }
      }
    }

    this.logger.info(
      `增量构建: 需要构建 ${rebuild.length} 个，跳过 ${skip.length} 个`
    )

    return { rebuild, skip }
  }

  /**
   * 更新构建清单
   */
  async updateManifest(docs: DocNode[]): Promise<void> {
    for (const doc of docs) {
      this.manifest.docs[doc.path] = {
        path: doc.path,
        outputPath: doc.outputPath || '',
        hash: await this.calculateDocHash(doc),
      }
    }

    this.manifest.timestamp = new Date().toISOString()

    await this.saveManifest()
  }

  /**
   * 计算文档哈希
   */
  private async calculateDocHash(doc: DocNode): Promise<string> {
    const crypto = await import('crypto')
    const content = JSON.stringify(doc.content)
    return crypto.createHash('md5').update(content).digest('hex')
  }

  /**
   * 加载构建清单
   */
  private loadManifest(): BuildManifest {
    try {
      if (fs.existsSync(this.manifestPath)) {
        return fs.readJSONSync(this.manifestPath)
      }
    } catch (error) {
      this.logger.debug('加载构建清单失败:', error)
    }

    return {
      timestamp: new Date().toISOString(),
      docs: {},
    }
  }

  /**
   * 保存构建清单
   */
  private async saveManifest(): Promise<void> {
    await fs.ensureDir(path.dirname(this.manifestPath))
    await fs.writeJSON(this.manifestPath, this.manifest, { spaces: 2 })
  }

  /**
   * 清除清单
   */
  async clearManifest(): Promise<void> {
    this.manifest = {
      timestamp: new Date().toISOString(),
      docs: {},
    }

    if (await fs.pathExists(this.manifestPath)) {
      await fs.remove(this.manifestPath)
    }

    this.logger.info('构建清单已清除')
  }
}

