/**
 * SearchIndexBuilder 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SearchIndexBuilder } from '../../src/features/search/SearchIndexBuilder'
import * as fs from 'fs-extra'
import * as path from 'path'
import type { Logger, DocNode } from '../../src/types'

// Mock Logger
const mockLogger: Logger = {
  info: () => { },
  warn: () => { },
  error: () => { },
  debug: () => { },
  success: () => { },
}

const testOutputDir = path.join(__dirname, '.test-output')

describe('SearchIndexBuilder', () => {
  let builder: SearchIndexBuilder

  beforeEach(async () => {
    await fs.ensureDir(testOutputDir)
    builder = new SearchIndexBuilder({
      logger: mockLogger,
      outputDir: testOutputDir,
    })
  })

  afterEach(async () => {
    await fs.remove(testOutputDir)
  })

  describe('buildFromDocs', () => {
    it('应该从文档节点构建索引', async () => {
      const docs: DocNode[] = [
        {
          type: 'markdown',
          name: 'test-doc',
          path: '/test/doc.md',
          metadata: {},
          content: {
            raw: '# Hello World\n\nThis is a test document.',
            html: '<h1>Hello World</h1><p>This is a test document.</p>',
          },
        },
      ]

      await builder.buildFromDocs(docs)

      const stats = builder.getStats()
      expect(stats.documentCount).toBe(1)
    })

    it('应该处理多个文档', async () => {
      const docs: DocNode[] = [
        {
          type: 'markdown',
          name: 'doc1',
          path: '/test/doc1.md',
          metadata: {},
          content: {
            raw: '# Document 1',
            html: '<h1>Document 1</h1>',
          },
        },
        {
          type: 'markdown',
          name: 'doc2',
          path: '/test/doc2.md',
          metadata: {},
          content: {
            raw: '# Document 2',
            html: '<h1>Document 2</h1>',
          },
        },
      ]

      await builder.buildFromDocs(docs)

      const stats = builder.getStats()
      expect(stats.documentCount).toBe(2)
    })
  })

  describe('search', () => {
    beforeEach(async () => {
      const docs: DocNode[] = [
        {
          type: 'markdown',
          name: 'typescript-guide',
          path: '/guides/typescript.md',
          metadata: { title: 'TypeScript Guide' },
          content: {
            raw: '# TypeScript Guide\n\nLearn TypeScript basics.',
            html: '<h1>TypeScript Guide</h1><p>Learn TypeScript basics.</p>',
          },
        },
        {
          type: 'markdown',
          name: 'javascript-guide',
          path: '/guides/javascript.md',
          metadata: { title: 'JavaScript Guide' },
          content: {
            raw: '# JavaScript Guide\n\nLearn JavaScript fundamentals.',
            html: '<h1>JavaScript Guide</h1><p>Learn JavaScript fundamentals.</p>',
          },
        },
      ]

      await builder.buildFromDocs(docs)
    })

    it('应该搜索并返回结果', () => {
      const results = builder.search('TypeScript')

      expect(results.length).toBeGreaterThan(0)
      expect(results[0].title).toContain('TypeScript')
    })

    it('应该支持模糊搜索', () => {
      const results = builder.search('Typescrit') // 拼写错误

      expect(results.length).toBeGreaterThan(0)
    })

    it('应该对空查询返回空结果', () => {
      const results = builder.search('')

      expect(results).toHaveLength(0)
    })
  })

  describe('saveIndex / loadIndex', () => {
    it('应该保存索引到文件', async () => {
      const docs: DocNode[] = [
        {
          type: 'markdown',
          name: 'test',
          path: '/test.md',
          metadata: {},
          content: {
            raw: '# Test',
            html: '<h1>Test</h1>',
          },
        },
      ]

      await builder.buildFromDocs(docs)
      await builder.saveIndex()

      const indexPath = path.join(testOutputDir, 'search-index.json')
      const exists = await fs.pathExists(indexPath)

      expect(exists).toBe(true)
    })

    it('应该加载保存的索引', async () => {
      const docs: DocNode[] = [
        {
          type: 'markdown',
          name: 'test',
          path: '/test.md',
          metadata: {},
          content: {
            raw: '# Test Document',
            html: '<h1>Test Document</h1>',
          },
        },
      ]

      await builder.buildFromDocs(docs)
      await builder.saveIndex()

      // 创建新实例并加载
      const builder2 = new SearchIndexBuilder({
        logger: mockLogger,
        outputDir: testOutputDir,
      })
      await builder2.loadIndex()

      const results = builder2.search('Test')
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('getStats', () => {
    it('应该返回索引统计信息', async () => {
      const docs: DocNode[] = [
        {
          type: 'markdown',
          name: 'test',
          path: '/test.md',
          metadata: {},
          content: {
            raw: '# Test',
            html: '<h1>Test</h1>',
          },
        },
      ]

      await builder.buildFromDocs(docs)

      const stats = builder.getStats()

      expect(stats.documentCount).toBe(1)
      expect(stats.fieldCount).toBeGreaterThan(0)
    })
  })
})



