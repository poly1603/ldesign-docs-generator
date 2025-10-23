/**
 * 文件监听器
 */

import * as fs from 'fs'
import * as path from 'path'

/**
 * 监听选项
 */
export interface WatchOptions {
  /** 监听的目录 */
  dir: string
  /** 忽略的模式 */
  ignore?: string[]
  /** 变化回调 */
  onChange: (file: string, event: 'change' | 'rename') => void
}

/**
 * 监听器
 */
export class Watcher {
  private watchers: Map<string, fs.FSWatcher> = new Map()
  private options: WatchOptions
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(options: WatchOptions) {
    this.options = options
  }

  /**
   * 开始监听
   */
  start(): void {
    this.watchDirectory(this.options.dir)
    console.log(`👀 监听文件变化: ${this.options.dir}`)
  }

  /**
   * 停止监听
   */
  stop(): void {
    for (const watcher of this.watchers.values()) {
      watcher.close()
    }
    this.watchers.clear()
    this.debounceTimers.clear()
    console.log('停止监听')
  }

  /**
   * 监听目录
   */
  private watchDirectory(dir: string): void {
    // 检查是否应该忽略
    if (this.shouldIgnore(dir)) {
      return
    }

    try {
      const watcher = fs.watch(dir, { recursive: false }, (event, filename) => {
        if (!filename) return

        const filePath = path.join(dir, filename)

        // 忽略某些文件
        if (this.shouldIgnore(filePath)) {
          return
        }

        // 防抖处理
        this.debounce(filePath, () => {
          this.handleChange(filePath, event)
        })
      })

      this.watchers.set(dir, watcher)

      // 递归监听子目录
      const items = fs.readdirSync(dir)
      for (const item of items) {
        const itemPath = path.join(dir, item)
        try {
          const stats = fs.statSync(itemPath)
          if (stats.isDirectory()) {
            this.watchDirectory(itemPath)
          }
        } catch {
          // 忽略错误
        }
      }
    } catch (error) {
      console.error(`监听目录失败: ${dir}`, error)
    }
  }

  /**
   * 处理文件变化
   */
  private handleChange(filePath: string, event: string): void {
    try {
      const stats = fs.statSync(filePath)

      if (stats.isDirectory()) {
        // 新增目录，开始监听
        if (!this.watchers.has(filePath)) {
          this.watchDirectory(filePath)
        }
      } else {
        // 文件变化
        this.options.onChange(filePath, event as 'change' | 'rename')
      }
    } catch {
      // 文件可能已被删除
      this.options.onChange(filePath, 'rename')
    }
  }

  /**
   * 是否应该忽略
   */
  private shouldIgnore(filePath: string): boolean {
    const ignore = this.options.ignore || [
      'node_modules',
      '.git',
      '.cache',
      'dist',
      'build',
      '.DS_Store',
    ]

    const basename = path.basename(filePath)

    for (const pattern of ignore) {
      if (basename === pattern) {
        return true
      }
      if (filePath.includes(path.sep + pattern + path.sep)) {
        return true
      }
      if (filePath.endsWith(path.sep + pattern)) {
        return true
      }
    }

    return false
  }

  /**
   * 防抖
   */
  private debounce(key: string, fn: () => void, delay = 300): void {
    const existingTimer = this.debounceTimers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      fn()
      this.debounceTimers.delete(key)
    }, delay)

    this.debounceTimers.set(key, timer)
  }
}

/**
 * 监听文件变化
 */
export function watchFiles(
  dir: string,
  onChange: (file: string) => void,
  options?: { ignore?: string[] }
): Watcher {
  const watcher = new Watcher({
    dir,
    ignore: options?.ignore,
    onChange: (file) => onChange(file),
  })

  watcher.start()
  return watcher
}




