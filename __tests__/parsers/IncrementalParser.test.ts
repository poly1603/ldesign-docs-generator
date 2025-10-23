/**
 * IncrementalParser 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { IncrementalParser } from '../../src/parsers/IncrementalParser'
import * as fs from 'fs-extra'
import * as path from 'path'
import type { Logger } from '../../src/types'

// Mock Logger
const mockLogger: Logger = {
  info: () => { },
  warn: () => { },
  error: () => { },
  debug: () => { },
  success: () => { },
}

const testCacheDir = path.join(__dirname, '.test-cache')

describe('IncrementalParser', () => {
  let parser: IncrementalParser

  beforeEach(async () => {
    await fs.ensureDir(testCacheDir)
    parser = new IncrementalParser(testCacheDir, mockLogger)
  })

  afterEach(async () => {
    await fs.remove(testCacheDir)
  })

  describe('detectChanges', () => {
    it('应该将所有文件标记为新增（首次运行）', async () => {
      const files = ['/path/to/file1.ts', '/path/to/file2.ts']

      const changes = await parser.detectChanges(files)

      expect(changes.added).toHaveLength(2)
      expect(changes.changed).toHaveLength(0)
      expect(changes.unchanged).toHaveLength(0)
      expect(changes.removed).toHaveLength(0)
    })

    it('应该检测未变化的文件', async () => {
      const testFile = path.join(testCacheDir, 'test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')

      // 第一次检测
      await parser.detectChanges([testFile])
      await parser.updateFileMetadata(testFile)
      await parser.saveCache()

      // 创建新实例以加载缓存
      const parser2 = new IncrementalParser(testCacheDir, mockLogger)
      const changes = await parser2.detectChanges([testFile])

      expect(changes.unchanged).toHaveLength(1)
      expect(changes.added).toHaveLength(0)
      expect(changes.changed).toHaveLength(0)
    })

    it('应该检测已变化的文件', async () => {
      const testFile = path.join(testCacheDir, 'test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')

      // 第一次检测
      await parser.detectChanges([testFile])
      await parser.updateFileMetadata(testFile)
      await parser.saveCache()

      // 修改文件
      await fs.writeFile(testFile, 'new content', 'utf-8')

      // 创建新实例以加载缓存
      const parser2 = new IncrementalParser(testCacheDir, mockLogger)
      const changes = await parser2.detectChanges([testFile])

      expect(changes.changed).toHaveLength(1)
      expect(changes.unchanged).toHaveLength(0)
    })

    it('应该检测已删除的文件', async () => {
      const testFile = path.join(testCacheDir, 'test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')

      // 第一次检测
      await parser.detectChanges([testFile])
      await parser.updateFileMetadata(testFile)
      await parser.saveCache()

      // 删除文件
      await fs.remove(testFile)

      // 创建新实例以加载缓存
      const parser2 = new IncrementalParser(testCacheDir, mockLogger)
      const changes = await parser2.detectChanges([])

      expect(changes.removed).toHaveLength(1)
    })
  })

  describe('cacheParseResult', () => {
    it('应该缓存解析结果', async () => {
      const file = '/path/to/file.ts'
      const result = { type: 'api', name: 'test' }

      await parser.cacheParseResult(file, result)

      const cached = parser.getCachedResult(file)
      expect(cached).toEqual(result)
    })
  })

  describe('getCachedResult', () => {
    it('应该返回缓存的结果', async () => {
      const file = '/path/to/file.ts'
      const result = { type: 'api', name: 'test' }

      await parser.cacheParseResult(file, result)

      const cached = parser.getCachedResult(file)
      expect(cached).toEqual(result)
    })

    it('应该对未缓存的文件返回 null', () => {
      const cached = parser.getCachedResult('/non-existent.ts')
      expect(cached).toBeNull()
    })
  })

  describe('removeFromCache', () => {
    it('应该从缓存中移除文件', async () => {
      const file = '/path/to/file.ts'
      const result = { type: 'api', name: 'test' }

      await parser.cacheParseResult(file, result)
      parser.removeFromCache(file)

      const cached = parser.getCachedResult(file)
      expect(cached).toBeNull()
    })
  })

  describe('clearCache', () => {
    it('应该清空所有缓存', async () => {
      const file = '/path/to/file.ts'
      const result = { type: 'api', name: 'test' }

      await parser.cacheParseResult(file, result)
      await parser.clearCache()

      const cached = parser.getCachedResult(file)
      expect(cached).toBeNull()
    })
  })

  describe('getCacheStats', () => {
    it('应该返回缓存统计信息', async () => {
      const testFile = path.join(testCacheDir, 'test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')

      await parser.updateFileMetadata(testFile)
      await parser.saveCache()

      const stats = parser.getCacheStats()

      expect(stats.fileCount).toBe(1)
      expect(stats.version).toBeDefined()
    })
  })
})



