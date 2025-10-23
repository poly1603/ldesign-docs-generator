/**
 * TypeDocPlugin 单元测试
 */

import { describe, it, expect } from 'vitest'
import { TypeDocPlugin } from '../../../src/plugins/parsers/typedoc-plugin'

describe('TypeDocPlugin', () => {
  describe('构造函数', () => {
    it('应该正确初始化', () => {
      const plugin = new TypeDocPlugin()
      expect(plugin.name).toBe('typedoc')
      expect(plugin.version).toBe('1.0.0')
    })
  })

  describe('parse', () => {
    it('应该解析 TypeScript 文件', async () => {
      // TODO: 实现测试
    })
  })
})




