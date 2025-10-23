/**
 * 站点生成 E2E 测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DocsGenerator } from '../../src/core/DocsGenerator'
import { markdownPlugin } from '../../src/plugins/parsers'
import * as fs from 'fs-extra'
import * as path from 'path'

const testDir = path.join(__dirname, '.test-site-gen')
const sourceDir = path.join(testDir, 'src')
const outputDir = path.join(testDir, 'docs')

describe('Site Generation E2E', () => {
  beforeEach(async () => {
    await fs.ensureDir(sourceDir)
  })

  afterEach(async () => {
    await fs.remove(testDir)
  })

  it('应该生成完整的可浏览站点', async () => {
    // 创建多个 Markdown 文件
    await fs.writeFile(
      path.join(sourceDir, 'index.md'),
      '---\ntitle: 首页\n---\n# Welcome\n\nThis is home page.',
      'utf-8'
    )

    await fs.writeFile(
      path.join(sourceDir, 'guide.md'),
      '# Guide\n\n## Getting Started\n\nLearn the basics.',
      'utf-8'
    )

    const generator = new DocsGenerator({
      sourceDir,
      outputDir,
      plugins: [markdownPlugin()],
      site: {
        title: 'Test Site',
        description: 'A test documentation site',
      },
      logLevel: 'silent',
    })

    await generator.generate()

    // 验证生成的文件
    const indexHtml = await fs.readFile(
      path.join(outputDir, 'index.html'),
      'utf-8'
    )

    expect(indexHtml).toContain('Welcome')
    expect(indexHtml).toContain('Test Site')

    // 验证导航
    expect(indexHtml).toMatch(/<nav|<aside|sidebar/)

    // 验证 TOC
    const guideHtml = await fs.readFile(
      path.join(outputDir, 'guide.html'),
      'utf-8'
    )

    expect(guideHtml).toContain('Getting Started')
  }, 30000)
})


