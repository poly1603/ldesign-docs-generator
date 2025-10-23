/**
 * 完整文档生成流程集成测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DocsGenerator } from '../../src/core/DocsGenerator'
import { typedocPlugin, vueComponentPlugin, markdownPlugin } from '../../src/plugins/parsers'
import * as fs from 'fs-extra'
import * as path from 'path'

const testDir = path.join(__dirname, '.test-integration')
const sourceDir = path.join(testDir, 'src')
const outputDir = path.join(testDir, 'docs')

describe('Full Generation Integration', () => {
  beforeEach(async () => {
    await fs.ensureDir(sourceDir)
    await fs.ensureDir(outputDir)
  })

  afterEach(async () => {
    await fs.remove(testDir)
  })

  it('应该成功生成完整的文档站点', async () => {
    // 创建测试文件
    await fs.writeFile(
      path.join(sourceDir, 'README.md'),
      '# Test\n\nThis is a test.',
      'utf-8'
    )

    await fs.writeFile(
      path.join(sourceDir, 'utils.ts'),
      `/**
 * Add two numbers
 * @param a - First number
 * @param b - Second number
 */
export function add(a: number, b: number): number {
  return a + b
}`,
      'utf-8'
    )

    // 创建生成器
    const generator = new DocsGenerator({
      sourceDir,
      outputDir,
      plugins: [
        markdownPlugin(),
        typedocPlugin({
          tsconfig: path.join(__dirname, '../../tsconfig.json'),
        }),
      ],
      site: {
        title: 'Test Docs',
      },
      logLevel: 'silent',
    })

    // 生成文档
    await generator.generate()

    // 验证输出
    const outputExists = await fs.pathExists(outputDir)
    expect(outputExists).toBe(true)

    const files = await fs.readdir(outputDir)
    expect(files.length).toBeGreaterThan(0)
  }, 30000) // 30秒超时

  it('应该支持增量构建', async () => {
    // 创建初始文件
    const file1 = path.join(sourceDir, 'file1.md')
    await fs.writeFile(file1, '# File 1', 'utf-8')

    const generator = new DocsGenerator({
      sourceDir,
      outputDir,
      plugins: [markdownPlugin()],
      site: { title: 'Test' },
      cacheDir: path.join(testDir, '.cache'),
      logLevel: 'silent',
    })

    // 首次生成
    const start1 = Date.now()
    await generator.generate()
    const duration1 = Date.now() - start1

    // 再次生成（应该更快）
    const start2 = Date.now()
    await generator.generate()
    const duration2 = Date.now() - start2

    // 增量构建应该更快
    expect(duration2).toBeLessThan(duration1)
  }, 30000)
})


