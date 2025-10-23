/**
 * PluginManager 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { PluginManager } from '../../src/core/PluginManager'
import type { DocsPlugin, Logger } from '../../src/types'

// Mock Logger
const mockLogger: Logger = {
  info: () => { },
  warn: () => { },
  error: () => { },
  debug: () => { },
  success: () => { },
}

describe('PluginManager', () => {
  let pluginManager: PluginManager

  beforeEach(() => {
    pluginManager = new PluginManager({
      logger: mockLogger,
    })
  })

  describe('register', () => {
    it('应该成功注册插件', () => {
      const plugin: DocsPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        parse: async () => ({ nodes: [] }),
      }

      const result = pluginManager.register(plugin)

      expect(result.success).toBe(true)
      expect(result.plugin).toBe(plugin)
    })

    it('应该拒绝没有 name 的插件', () => {
      const plugin = {
        version: '1.0.0',
        parse: async () => ({ nodes: [] }),
      } as any

      const result = pluginManager.register(plugin)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该拒绝没有 version 的插件', () => {
      const plugin = {
        name: 'test-plugin',
        parse: async () => ({ nodes: [] }),
      } as any

      const result = pluginManager.register(plugin)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该拒绝没有任何钩子的插件', () => {
      const plugin = {
        name: 'test-plugin',
        version: '1.0.0',
      } as any

      const result = pluginManager.register(plugin)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('registerAll', () => {
    it('应该注册多个插件', () => {
      const plugins: DocsPlugin[] = [
        {
          name: 'plugin-1',
          version: '1.0.0',
          parse: async () => ({ nodes: [] }),
        },
        {
          name: 'plugin-2',
          version: '1.0.0',
          transform: async (docs) => docs,
        },
      ]

      const results = pluginManager.registerAll(plugins)

      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(true)
    })

    it('应该按依赖顺序排列插件', () => {
      const plugins: DocsPlugin[] = [
        {
          name: 'plugin-a',
          version: '1.0.0',
          dependencies: ['plugin-b'],
          parse: async () => ({ nodes: [] }),
        },
        {
          name: 'plugin-b',
          version: '1.0.0',
          parse: async () => ({ nodes: [] }),
        },
      ]

      pluginManager.registerAll(plugins)
      const info = pluginManager.getPluginInfo()

      // plugin-b 应该在 plugin-a 之前
      expect(info[0].name).toBe('plugin-b')
      expect(info[1].name).toBe('plugin-a')
    })

    it('应该检测循环依赖', () => {
      const plugins: DocsPlugin[] = [
        {
          name: 'plugin-a',
          version: '1.0.0',
          dependencies: ['plugin-b'],
          parse: async () => ({ nodes: [] }),
        },
        {
          name: 'plugin-b',
          version: '1.0.0',
          dependencies: ['plugin-a'],
          parse: async () => ({ nodes: [] }),
        },
      ]

      expect(() => {
        pluginManager.registerAll(plugins)
      }).toThrow()
    })
  })

  describe('getPlugin', () => {
    it('应该获取已注册的插件', () => {
      const plugin: DocsPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        parse: async () => ({ nodes: [] }),
      }

      pluginManager.register(plugin)
      const retrieved = pluginManager.getPlugin('test-plugin')

      expect(retrieved).toBe(plugin)
    })

    it('应该对未注册的插件返回 undefined', () => {
      const retrieved = pluginManager.getPlugin('non-existent')

      expect(retrieved).toBeUndefined()
    })
  })

  describe('getAllPlugins', () => {
    it('应该返回所有已注册的插件', () => {
      const plugins: DocsPlugin[] = [
        {
          name: 'plugin-1',
          version: '1.0.0',
          parse: async () => ({ nodes: [] }),
        },
        {
          name: 'plugin-2',
          version: '1.0.0',
          parse: async () => ({ nodes: [] }),
        },
      ]

      pluginManager.registerAll(plugins)
      const all = pluginManager.getAllPlugins()

      expect(all).toHaveLength(2)
    })
  })

  describe('executeParse', () => {
    it('应该执行所有插件的 parse 钩子', async () => {
      let plugin1Called = false
      let plugin2Called = false

      const plugins: DocsPlugin[] = [
        {
          name: 'plugin-1',
          version: '1.0.0',
          parse: async () => {
            plugin1Called = true
            return { nodes: [] }
          },
        },
        {
          name: 'plugin-2',
          version: '1.0.0',
          parse: async () => {
            plugin2Called = true
            return { nodes: [] }
          },
        },
      ]

      pluginManager.registerAll(plugins)
      await pluginManager.executeParse({
        files: [],
        sourceDir: '/test',
        options: {},
        logger: mockLogger,
      })

      expect(plugin1Called).toBe(true)
      expect(plugin2Called).toBe(true)
    })

    it('应该收集所有插件的节点', async () => {
      const plugins: DocsPlugin[] = [
        {
          name: 'plugin-1',
          version: '1.0.0',
          parse: async () => ({
            nodes: [
              {
                type: 'api',
                name: 'test1',
                path: '/test1',
                metadata: {},
                content: {},
              },
            ],
          }),
        },
        {
          name: 'plugin-2',
          version: '1.0.0',
          parse: async () => ({
            nodes: [
              {
                type: 'api',
                name: 'test2',
                path: '/test2',
                metadata: {},
                content: {},
              },
            ],
          }),
        },
      ]

      pluginManager.registerAll(plugins)
      const result = await pluginManager.executeParse({
        files: [],
        sourceDir: '/test',
        options: {},
        logger: mockLogger,
      })

      expect(result.nodes).toHaveLength(2)
      expect(result.nodes[0].name).toBe('test1')
      expect(result.nodes[1].name).toBe('test2')
    })
  })

  describe('executeTransform', () => {
    it('应该按顺序执行转换钩子', async () => {
      const order: number[] = []

      const plugins: DocsPlugin[] = [
        {
          name: 'plugin-1',
          version: '1.0.0',
          transform: async (docs) => {
            order.push(1)
            return docs
          },
        },
        {
          name: 'plugin-2',
          version: '1.0.0',
          transform: async (docs) => {
            order.push(2)
            return docs
          },
        },
      ]

      pluginManager.registerAll(plugins)
      await pluginManager.executeTransform([], {
        files: [],
        sourceDir: '/test',
        options: {},
        logger: mockLogger,
      })

      expect(order).toEqual([1, 2])
    })
  })

  describe('enableHotReload', () => {
    it('应该启用热重载', () => {
      pluginManager.enableHotReload()
      // 验证通过没有抛出错误
      expect(true).toBe(true)
    })
  })

  describe('clear', () => {
    it('应该清空所有插件', () => {
      const plugin: DocsPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        parse: async () => ({ nodes: [] }),
      }

      pluginManager.register(plugin)
      pluginManager.clear()

      const all = pluginManager.getAllPlugins()
      expect(all).toHaveLength(0)
    })
  })
})



