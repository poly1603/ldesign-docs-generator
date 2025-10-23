/**
 * TemplateEngine 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TemplateEngine } from '../../src/generators/TemplateEngine'
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

describe('TemplateEngine', () => {
  let engine: TemplateEngine
  const templateDir = path.join(__dirname, '../../templates/default')

  beforeEach(async () => {
    engine = new TemplateEngine({
      templateDir,
      logger: mockLogger,
      engine: 'ejs',
    })
    await engine.init()
  })

  describe('render', () => {
    it('应该渲染简单模板', async () => {
      const template = 'Hello <%= name %>!'
      const data = { name: 'World' }

      const result = await engine.render(template, data)

      expect(result).toBe('Hello World!')
    })

    it('应该支持复杂数据', async () => {
      const template = '<% items.forEach(item => { %><%= item %><% }) %>'
      const data = { items: ['a', 'b', 'c'] }

      const result = await engine.render(template, data)

      expect(result).toBe('abc')
    })
  })

  describe('registerHelper', () => {
    it('应该注册辅助函数', async () => {
      engine.registerHelper('uppercase', (str: string) => str.toUpperCase())

      const template = '<%= uppercase(name) %>'
      const data = { name: 'hello' }

      const result = await engine.render(template, data)

      expect(result).toBe('HELLO')
    })
  })

  describe('registerFilter', () => {
    it('应该注册过滤器', async () => {
      engine.registerFilter('truncate', (str: string, len: number) =>
        str.substring(0, len)
      )

      const template = '<%= truncate(text, 5) %>'
      const data = { text: 'Hello World' }

      const result = await engine.render(template, data)

      expect(result).toBe('Hello')
    })
  })

  describe('clearCache', () => {
    it('应该清除模板缓存', () => {
      engine.clearCache()
      // 验证通过没有抛出错误
      expect(true).toBe(true)
    })
  })

  describe('getAdapterName', () => {
    it('应该返回适配器名称', () => {
      const name = engine.getAdapterName()
      expect(name).toBe('ejs')
    })
  })

  describe('多引擎支持', () => {
    it('应该支持 EJS 引擎', async () => {
      const ejsEngine = new TemplateEngine({
        templateDir,
        logger: mockLogger,
        engine: 'ejs',
      })
      await ejsEngine.init()

      expect(ejsEngine.getAdapterName()).toBe('ejs')
    })

    // 注意：handlebars 和 nunjucks 是可选依赖，可能未安装
    // 这些测试在实际环境中可能需要跳过
  })
})



