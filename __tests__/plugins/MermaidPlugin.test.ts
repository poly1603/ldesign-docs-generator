/**
 * MermaidPlugin 单元测试
 */

import { describe, it, expect } from 'vitest'
import { mermaidPlugin } from '../../src/plugins/enhancements/MermaidPlugin'
import type { DocNode, Logger } from '../../src/types'

// Mock Logger
const mockLogger: Logger = {
  info: () => { },
  warn: () => { },
  error: () => { },
  debug: () => { },
  success: () => { },
}

describe('MermaidPlugin', () => {
  it('应该检测 Mermaid 代码块', async () => {
    const plugin = mermaidPlugin()

    const docs: DocNode[] = [
      {
        type: 'markdown',
        name: 'test',
        path: '/test.md',
        metadata: {},
        content: {
          raw: '```mermaid\ngraph TD\n  A-->B\n```',
          html: '<pre><code class="language-mermaid">graph TD\n  A--&gt;B\n</code></pre>',
        },
      },
    ]

    const transformed = await plugin.transform!(docs, {
      files: [],
      sourceDir: '/test',
      options: {},
      logger: mockLogger,
    })

    expect(transformed[0].metadata.hasMermaid).toBe(true)
    expect(transformed[0].metadata.mermaidBlocks).toHaveLength(1)
  })

  it('应该转换 HTML 中的 Mermaid 代码块', async () => {
    const plugin = mermaidPlugin()

    const docs: DocNode[] = [
      {
        type: 'markdown',
        name: 'test',
        path: '/test.md',
        metadata: {},
        content: {
          raw: '```mermaid\ngraph TD\n  A-->B\n```',
          html: '<pre><code class="language-mermaid">graph TD\n  A--&gt;B\n</code></pre>',
        },
      },
    ]

    const transformed = await plugin.transform!(docs, {
      files: [],
      sourceDir: '/test',
      options: {},
      logger: mockLogger,
    })

    expect(transformed[0].content.html).toContain('<div class="mermaid">')
  })

  it('应该跳过没有 Mermaid 的文档', async () => {
    const plugin = mermaidPlugin()

    const docs: DocNode[] = [
      {
        type: 'markdown',
        name: 'test',
        path: '/test.md',
        metadata: {},
        content: {
          raw: '# Hello World',
          html: '<h1>Hello World</h1>',
        },
      },
    ]

    const transformed = await plugin.transform!(docs, {
      files: [],
      sourceDir: '/test',
      options: {},
      logger: mockLogger,
    })

    expect(transformed[0].metadata.hasMermaid).toBeUndefined()
  })
})



