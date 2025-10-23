/**
 * 插件系统集成测试
 */

import { describe, it, expect } from 'vitest'
import { PluginManager } from '../../src/core/PluginManager'
import type { DocsPlugin, Logger } from '../../src/types'

const mockLogger: Logger = {
  info: () => { },
  warn: () => { },
  error: () => { },
  debug: () => { },
  success: () => { },
}

describe('Plugin System Integration', () => {
  it('应该正确处理插件依赖链', async () => {
    const executionOrder: string[] = []

    const plugins: DocsPlugin[] = [
      {
        name: 'plugin-c',
        version: '1.0.0',
        dependencies: ['plugin-b'],
        parse: async () => {
          executionOrder.push('plugin-c')
          return { nodes: [] }
        },
      },
      {
        name: 'plugin-a',
        version: '1.0.0',
        parse: async () => {
          executionOrder.push('plugin-a')
          return { nodes: [] }
        },
      },
      {
        name: 'plugin-b',
        version: '1.0.0',
        dependencies: ['plugin-a'],
        parse: async () => {
          executionOrder.push('plugin-b')
          return { nodes: [] }
        },
      },
    ]

    const manager = new PluginManager({ logger: mockLogger })
    manager.registerAll(plugins)

    await manager.executeParse({
      files: [],
      sourceDir: '/test',
      options: {},
      logger: mockLogger,
    })

    // 应该按依赖顺序执行: a -> b -> c
    expect(executionOrder).toEqual(['plugin-a', 'plugin-b', 'plugin-c'])
  })

  it('应该执行所有生命周期钩子', async () => {
    const hooks: string[] = []

    const plugin: DocsPlugin = {
      name: 'lifecycle-test',
      version: '1.0.0',

      beforeParse: async () => {
        hooks.push('beforeParse')
      },
      parse: async () => {
        hooks.push('parse')
        return { nodes: [] }
      },
      afterParse: async (result) => {
        hooks.push('afterParse')
        return result
      },
      beforeTransform: async () => {
        hooks.push('beforeTransform')
      },
      transform: async (docs) => {
        hooks.push('transform')
        return docs
      },
      afterTransform: async (docs) => {
        hooks.push('afterTransform')
        return docs
      },
      beforeGenerate: async () => {
        hooks.push('beforeGenerate')
      },
      generate: async () => {
        hooks.push('generate')
      },
      afterGenerate: async () => {
        hooks.push('afterGenerate')
      },
    }

    const manager = new PluginManager({ logger: mockLogger })
    manager.register(plugin)

    // 执行所有阶段
    const parseResult = await manager.executeParse({
      files: [],
      sourceDir: '/test',
      options: {},
      logger: mockLogger,
    })

    await manager.executeTransform(parseResult.nodes, {
      files: [],
      sourceDir: '/test',
      options: {},
      logger: mockLogger,
    })

    await manager.executeGenerate({
      docs: parseResult.nodes,
      outputDir: '/test/output',
      siteConfig: { title: 'Test' },
      options: {},
      logger: mockLogger,
    })

    expect(hooks).toEqual([
      'beforeParse',
      'parse',
      'afterParse',
      'beforeTransform',
      'transform',
      'afterTransform',
      'beforeGenerate',
      'generate',
      'afterGenerate',
    ])
  })

  it('应该处理插件错误而不中断流程', async () => {
    const plugins: DocsPlugin[] = [
      {
        name: 'good-plugin',
        version: '1.0.0',
        parse: async () => ({ nodes: [{ type: 'custom', name: 'good', path: '/good', metadata: {}, content: {} }] }),
      },
      {
        name: 'bad-plugin',
        version: '1.0.0',
        parse: async () => {
          throw new Error('Plugin error')
        },
      },
      {
        name: 'another-good-plugin',
        version: '1.0.0',
        parse: async () => ({ nodes: [{ type: 'custom', name: 'another', path: '/another', metadata: {}, content: {} }] }),
      },
    ]

    const manager = new PluginManager({ logger: mockLogger })
    manager.registerAll(plugins)

    const result = await manager.executeParse({
      files: [],
      sourceDir: '/test',
      options: {},
      logger: mockLogger,
    })

    // 应该收集到两个好的插件的节点
    expect(result.nodes.length).toBe(2)
    // 应该有错误记录
    expect(result.errors).toBeDefined()
  })
})


