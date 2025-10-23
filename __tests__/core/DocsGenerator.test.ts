/**
 * DocsGenerator 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DocsGenerator } from '../../src/core/DocsGenerator'
import type { DocsGeneratorOptions } from '../../src/types'

describe('DocsGenerator', () => {
  let options: DocsGeneratorOptions

  beforeEach(() => {
    options = {
      sourceDir: './test-src',
      outputDir: './test-output',
      plugins: [],
      site: {
        title: 'Test Docs',
        description: 'Test documentation',
      },
    }
  })

  describe('构造函数', () => {
    it('应该正确初始化', () => {
      const generator = new DocsGenerator(options)
      expect(generator).toBeDefined()
    })

    it('应该合并默认配置', () => {
      const generator = new DocsGenerator({
        sourceDir: './src',
        outputDir: './docs',
      })
      expect(generator).toBeDefined()
    })
  })

  describe('generate', () => {
    it('应该生成文档', async () => {
      // TODO: 实现测试
    })
  })

  describe('build', () => {
    it('应该构建文档', async () => {
      // TODO: 实现测试
    })
  })
})




