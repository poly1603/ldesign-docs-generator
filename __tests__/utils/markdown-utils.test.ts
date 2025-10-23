/**
 * markdown-utils 单元测试
 */

import { describe, it, expect } from 'vitest'
import {
  extractFrontmatter,
  generateSlug,
  extractHeadings,
  countWords,
  estimateReadingTime,
} from '../../src/utils/markdown-utils'

describe('markdown-utils', () => {
  describe('extractFrontmatter', () => {
    it('应该提取 frontmatter', () => {
      const markdown = `---
title: Test
tags: [test, markdown]
---

# Content`

      const result = extractFrontmatter(markdown)

      expect(result.data).toEqual({
        title: 'Test',
        tags: ['test', 'markdown'],
      })
      expect(result.content).toContain('# Content')
    })

    it('应该处理没有 frontmatter 的文档', () => {
      const markdown = '# Hello World'

      const result = extractFrontmatter(markdown)

      expect(result.data).toEqual({})
      expect(result.content).toBe(markdown)
    })
  })

  describe('generateSlug', () => {
    it('应该生成正确的 slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
      expect(generateSlug('TypeScript Guide')).toBe('typescript-guide')
      expect(generateSlug('API 文档')).toBe('api-文档')
    })

    it('应该处理特殊字符', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world')
      expect(generateSlug('test/path')).toBe('test-path')
    })
  })

  describe('extractHeadings', () => {
    it('应该提取标题', () => {
      const markdown = `# Level 1
## Level 2
### Level 3
## Another Level 2`

      const headings = extractHeadings(markdown)

      expect(headings).toHaveLength(4)
      expect(headings[0]).toMatchObject({
        level: 1,
        title: 'Level 1',
      })
      expect(headings[1]).toMatchObject({
        level: 2,
        title: 'Level 2',
      })
    })

    it('应该生成 slug', () => {
      const markdown = '# Hello World'

      const headings = extractHeadings(markdown)

      expect(headings[0].slug).toBe('hello-world')
    })
  })

  describe('countWords', () => {
    it('应该统计英文单词数', () => {
      const text = 'Hello world, this is a test.'

      const count = countWords(text)

      expect(count).toBe(6)
    })

    it('应该统计中文字符数', () => {
      const text = '这是一个测试'

      const count = countWords(text)

      expect(count).toBe(5)
    })

    it('应该统计混合文本', () => {
      const text = 'Hello 世界'

      const count = countWords(text)

      expect(count).toBe(3) // Hello + 世 + 界
    })
  })

  describe('estimateReadingTime', () => {
    it('应该估算阅读时间', () => {
      const text = 'word '.repeat(200) // 200 words

      const time = estimateReadingTime(text)

      expect(time).toBe(1) // 200 words / 200 wpm = 1 minute
    })

    it('应该至少返回 1 分钟', () => {
      const text = 'short text'

      const time = estimateReadingTime(text)

      expect(time).toBe(1)
    })
  })
})



