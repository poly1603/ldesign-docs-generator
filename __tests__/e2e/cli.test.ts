/**
 * CLI E2E 测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs-extra'
import * as path from 'path'

const execAsync = promisify(exec)
const testDir = path.join(__dirname, '.test-e2e')

describe('CLI E2E Tests', () => {
  beforeEach(async () => {
    await fs.ensureDir(testDir)
  })

  afterEach(async () => {
    await fs.remove(testDir)
  })

  it('应该执行 init 命令', async () => {
    const { stdout } = await execAsync('node ../../bin/cli.js init', {
      cwd: testDir,
    })

    expect(stdout).toContain('配置文件已创建')

    const configExists = await fs.pathExists(
      path.join(testDir, 'docs-generator.config.js')
    )
    expect(configExists).toBe(true)
  }, 30000)

  it('应该执行 generate 命令', async () => {
    // 创建测试文件
    const srcDir = path.join(testDir, 'src')
    await fs.ensureDir(srcDir)
    await fs.writeFile(
      path.join(srcDir, 'test.md'),
      '# Test\nContent',
      'utf-8'
    )

    // 创建配置
    await fs.writeFile(
      path.join(testDir, 'docs-generator.config.js'),
      `module.exports = {
  sourceDir: './src',
  outputDir: './docs',
  plugins: [],
  site: { title: 'Test' },
}`,
      'utf-8'
    )

    const { stdout } = await execAsync('node ../../bin/cli.js generate', {
      cwd: testDir,
    })

    expect(stdout).toContain('文档生成完成')

    const docsExists = await fs.pathExists(path.join(testDir, 'docs'))
    expect(docsExists).toBe(true)
  }, 30000)

  it('应该执行 clean 命令', async () => {
    const docsDir = path.join(testDir, 'docs')
    await fs.ensureDir(docsDir)
    await fs.writeFile(path.join(docsDir, 'test.html'), '<html></html>')

    const { stdout } = await execAsync('node ../../bin/cli.js clean -o ./docs', {
      cwd: testDir,
    })

    expect(stdout).toContain('清理完成')

    const files = await fs.readdir(docsDir)
    expect(files.length).toBe(0)
  }, 30000)
})


