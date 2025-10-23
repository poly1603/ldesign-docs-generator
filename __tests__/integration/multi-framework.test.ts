/**
 * 多框架混合项目集成测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DocsGenerator } from '../../src/core/DocsGenerator'
import { vueComponentPlugin, reactComponentPlugin, markdownPlugin } from '../../src/plugins/parsers'
import * as fs from 'fs-extra'
import * as path from 'path'

const testDir = path.join(__dirname, '.test-multi-framework')
const sourceDir = path.join(testDir, 'src')
const outputDir = path.join(testDir, 'docs')

describe('Multi-Framework Integration', () => {
  beforeEach(async () => {
    await fs.ensureDir(sourceDir)
  })

  afterEach(async () => {
    await fs.remove(testDir)
  })

  it('应该同时处理 Vue 和 React 组件', async () => {
    // 创建 Vue 组件
    await fs.writeFile(
      path.join(sourceDir, 'Button.vue'),
      `<template>
  <button>Click</button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'default'
}
defineProps<Props>()
</script>`,
      'utf-8'
    )

    // 创建 React 组件
    await fs.writeFile(
      path.join(sourceDir, 'Card.tsx'),
      `export interface CardProps {
  title: string
}

export function Card({ title }: CardProps) {
  return <div>{title}</div>
}`,
      'utf-8'
    )

    // 创建 Markdown
    await fs.writeFile(
      path.join(sourceDir, 'guide.md'),
      '# Guide\n\nHow to use components.',
      'utf-8'
    )

    const generator = new DocsGenerator({
      sourceDir,
      outputDir,
      plugins: [
        vueComponentPlugin(),
        reactComponentPlugin(),
        markdownPlugin(),
      ],
      site: { title: 'Multi-Framework Docs' },
      logLevel: 'silent',
    })

    await generator.generate()

    // 验证输出
    const outputExists = await fs.pathExists(outputDir)
    expect(outputExists).toBe(true)
  }, 30000)
})


