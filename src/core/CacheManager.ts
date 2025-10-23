/**
 * 缓存管理器
 */

import * as fs from 'fs-extra'
import * as path from 'path'
import * as crypto from 'crypto'

/**
 * 缓存条目
 */
interface CacheEntry<T = any> {
  /** 缓存数据 */
  data: T
  /** 时间戳 */
  timestamp: number
  /** 过期时间（毫秒） */
  ttl?: number
}

/**
 * 缓存选项
 */
export interface CacheOptions {
  /** 缓存目录 */
  cacheDir?: string
  /** 默认 TTL（毫秒） */
  defaultTTL?: number
  /** 是否持久化 */
  persistent?: boolean
}

/**
 * 缓存管理器
 */
export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map()
  private options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    this.options = {
      cacheDir: options.cacheDir || '.cache/docs-generator',
      defaultTTL: options.defaultTTL || 1000 * 60 * 60, // 1 小时
      persistent: options.persistent !== false,
    }

    if (this.options.persistent) {
      this.loadFromDisk()
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(
    key: string,
    factory?: () => Promise<T>,
    ttl?: number
  ): Promise<T | undefined> {
    const entry = this.cache.get(key)

    // 缓存命中且未过期
    if (entry && !this.isExpired(entry)) {
      return entry.data as T
    }

    // 缓存未命中，使用工厂函数
    if (factory) {
      const data = await factory()
      await this.set(key, data, ttl)
      return data
    }

    return undefined
  }

  /**
   * 设置缓存
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.options.defaultTTL,
    }

    this.cache.set(key, entry)

    if (this.options.persistent) {
      await this.saveToDisk(key, entry)
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key)

    if (this.options.persistent) {
      const filePath = this.getCacheFilePath(key)
      await fs.remove(filePath)
    }
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    this.cache.clear()

    if (this.options.persistent) {
      await fs.emptyDir(this.options.cacheDir)
    }
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry != null && !this.isExpired(entry)
  }

  /**
   * 获取缓存键列表
   */
  keys(): string[] {
    const keys: string[] = []
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isExpired(entry)) {
        keys.push(key)
      }
    }
    return keys
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    let count = 0
    for (const [_, entry] of this.cache.entries()) {
      if (!this.isExpired(entry)) {
        count++
      }
    }
    return count
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key)
    }
  }

  /**
   * 检查是否过期
   */
  private isExpired(entry: CacheEntry): boolean {
    if (!entry.ttl) return false
    return Date.now() - entry.timestamp > entry.ttl
  }

  /**
   * 生成缓存文件路径
   */
  private getCacheFilePath(key: string): string {
    const hash = crypto.createHash('md5').update(key).digest('hex')
    return path.join(this.options.cacheDir, `${hash}.json`)
  }

  /**
   * 保存到磁盘
   */
  private async saveToDisk(key: string, entry: CacheEntry): Promise<void> {
    try {
      const filePath = this.getCacheFilePath(key)
      await fs.ensureDir(path.dirname(filePath))
      await fs.writeJSON(filePath, {
        key,
        ...entry,
      })
    } catch {
      // 忽略写入错误
    }
  }

  /**
   * 从磁盘加载
   */
  private loadFromDisk(): void {
    try {
      if (!fs.existsSync(this.options.cacheDir)) {
        return
      }

      const files = fs.readdirSync(this.options.cacheDir)

      for (const file of files) {
        if (!file.endsWith('.json')) continue

        try {
          const filePath = path.join(this.options.cacheDir, file)
          const data = fs.readJSONSync(filePath)

          if (data.key && data.data && data.timestamp) {
            const entry: CacheEntry = {
              data: data.data,
              timestamp: data.timestamp,
              ttl: data.ttl,
            }

            if (!this.isExpired(entry)) {
              this.cache.set(data.key, entry)
            } else {
              // 删除过期文件
              fs.removeSync(filePath)
            }
          }
        } catch {
          // 忽略单个文件错误
        }
      }
    } catch {
      // 忽略加载错误
    }
  }
}




