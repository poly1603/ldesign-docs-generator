/**
 * 增量解析器
 * 
 * 只解析变化的文件，提高大型项目的解析性能
 */

import fs from 'fs-extra'
import * as crypto from 'crypto'
import * as path from 'path'
import type { Logger } from '../types'

/**
 * 文件元数据
 */
interface FileMetadata {
  /** 文件路径 */
  path: string
  /** 文件哈希 */
  hash: string
  /** 最后修改时间 */
  mtime: number
  /** 文件大小 */
  size: number
}

/**
 * 解析缓存
 */
interface ParseCache {
  /** 文件元数据 */
  files: Record<string, FileMetadata>
  /** 解析结果（文件路径 -> 结果的序列化）*/
  results: Record<string, any>
  /** 缓存版本 */
  version: string
}

/**
 * 增量解析器
 */
export class IncrementalParser {
  private logger: Logger
  private cacheDir: string
  private cachePath: string
  private cache: ParseCache
  private cacheVersion = '1.0.0'

  constructor(cacheDir: string, logger: Logger) {
    this.logger = logger
    this.cacheDir = cacheDir
    this.cachePath = path.join(cacheDir, 'incremental-cache.json')
    this.cache = this.loadCache()
  }

  /**
   * 检测文件变化
   * 
   * @param files 要检查的文件列表
   * @returns 变化的文件列表
   */
  async detectChanges(files: string[]): Promise<{
    changed: string[]
    unchanged: string[]
    added: string[]
    removed: string[]
  }> {
    const changed: string[] = []
    const unchanged: string[] = []
    const added: string[] = []
    const currentFiles = new Set(files)
    const cachedFiles = new Set(Object.keys(this.cache.files))

    // 检查已存在的文件
    for (const file of files) {
      const cached = this.cache.files[file]

      if (!cached) {
        // 新文件
        added.push(file)
        continue
      }

      // 检查文件是否变化
      try {
        const hasChanged = await this.hasFileChanged(file, cached)
        if (hasChanged) {
          changed.push(file)
        } else {
          unchanged.push(file)
        }
      } catch (error) {
        this.logger.warn(`检查文件变化失败 ${file}:`, error)
        changed.push(file) // 出错时重新解析
      }
    }

    // 检查删除的文件
    const removed: string[] = []
    for (const cachedFile of cachedFiles) {
      if (!currentFiles.has(cachedFile)) {
        removed.push(cachedFile)
      }
    }

    this.logger.debug(`文件变化检测: 新增 ${added.length}, 变化 ${changed.length}, 未变化 ${unchanged.length}, 删除 ${removed.length}`)

    return { changed, unchanged, added, removed }
  }

  /**
   * 检查文件是否变化
   */
  private async hasFileChanged(file: string, cached: FileMetadata): Promise<boolean> {
    // 检查文件是否存在
    if (!(await fs.pathExists(file))) {
      return true
    }

    // 获取文件状态
    const stats = await fs.stat(file)

    // 快速检查：文件大小或修改时间变化
    if (stats.size !== cached.size || stats.mtimeMs !== cached.mtime) {
      return true
    }

    // 精确检查：文件哈希变化
    const currentHash = await this.calculateFileHash(file)
    return currentHash !== cached.hash
  }

  /**
   * 计算文件哈希
   */
  private async calculateFileHash(file: string): Promise<string> {
    const content = await fs.readFile(file)
    return crypto.createHash('md5').update(content).digest('hex')
  }

  /**
   * 更新文件元数据
   */
  async updateFileMetadata(file: string): Promise<void> {
    try {
      const stats = await fs.stat(file)
      const hash = await this.calculateFileHash(file)

      this.cache.files[file] = {
        path: file,
        hash,
        mtime: stats.mtimeMs,
        size: stats.size,
      }
    } catch (error) {
      this.logger.error(`更新文件元数据失败 ${file}:`, error)
    }
  }

  /**
   * 保存解析结果到缓存
   */
  async cacheParseResult(file: string, result: any): Promise<void> {
    this.cache.results[file] = result
    await this.updateFileMetadata(file)
  }

  /**
   * 从缓存获取解析结果
   */
  getCachedResult(file: string): any | null {
    return this.cache.results[file] || null
  }

  /**
   * 移除文件缓存
   */
  removeFromCache(file: string): void {
    delete this.cache.files[file]
    delete this.cache.results[file]
  }

  /**
   * 保存缓存到磁盘
   */
  async saveCache(): Promise<void> {
    try {
      await fs.ensureDir(this.cacheDir)
      await fs.writeJSON(this.cachePath, this.cache, { spaces: 2 })
      this.logger.debug(`增量解析缓存已保存: ${this.cachePath}`)
    } catch (error) {
      this.logger.error('保存增量解析缓存失败:', error)
    }
  }

  /**
   * 加载缓存
   */
  private loadCache(): ParseCache {
    try {
      if (fs.existsSync(this.cachePath)) {
        const cache = fs.readJSONSync(this.cachePath) as ParseCache

        // 检查缓存版本
        if (cache.version !== this.cacheVersion) {
          this.logger.warn(`缓存版本不匹配，将创建新缓存`)
          return this.createEmptyCache()
        }

        this.logger.debug(`增量解析缓存已加载: ${Object.keys(cache.files).length} 个文件`)
        return cache
      }
    } catch (error) {
      this.logger.warn('加载增量解析缓存失败:', error)
    }

    return this.createEmptyCache()
  }

  /**
   * 创建空缓存
   */
  private createEmptyCache(): ParseCache {
    return {
      files: {},
      results: {},
      version: this.cacheVersion,
    }
  }

  /**
   * 清空缓存
   */
  async clearCache(): Promise<void> {
    this.cache = this.createEmptyCache()
    try {
      if (await fs.pathExists(this.cachePath)) {
        await fs.remove(this.cachePath)
      }
      this.logger.info('增量解析缓存已清空')
    } catch (error) {
      this.logger.error('清空增量解析缓存失败:', error)
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    fileCount: number
    cacheSize: string
    version: string
  } {
    const fileCount = Object.keys(this.cache.files).length

    let cacheSize = '0 B'
    try {
      if (fs.existsSync(this.cachePath)) {
        const stats = fs.statSync(this.cachePath)
        const bytes = stats.size
        if (bytes < 1024) {
          cacheSize = `${bytes} B`
        } else if (bytes < 1024 * 1024) {
          cacheSize = `${(bytes / 1024).toFixed(2)} KB`
        } else {
          cacheSize = `${(bytes / (1024 * 1024)).toFixed(2)} MB`
        }
      }
    } catch (error) {
      // 忽略错误
    }

    return {
      fileCount,
      cacheSize,
      version: this.cacheVersion,
    }
  }
}



