/**
 * 构建验证脚本
 */

import * as fs from 'fs-extra'
import * as path from 'path'

interface CheckResult {
  name: string
  passed: boolean
  message: string
}

const results: CheckResult[] = []

/**
 * 检查文件是否存在
 */
async function checkFileExists(filePath: string, description: string): Promise<void> {
  const exists = await fs.pathExists(filePath)
  results.push({
    name: description,
    passed: exists,
    message: exists ? `✓ ${filePath}` : `✗ ${filePath} 不存在`,
  })
}

/**
 * 检查目录是否存在
 */
async function checkDirExists(dirPath: string, description: string): Promise<void> {
  const exists = await fs.pathExists(dirPath)
  results.push({
    name: description,
    passed: exists,
    message: exists ? `✓ ${dirPath}` : `✗ ${dirPath} 不存在`,
  })
}

/**
 * 检查 package.json
 */
async function checkPackageJson(): Promise<void> {
  const pkg = await fs.readJSON('package.json')

  // 检查必要字段
  const requiredFields = ['name', 'version', 'main', 'module', 'types', 'bin']
  for (const field of requiredFields) {
    const exists = pkg[field] != null
    results.push({
      name: `package.json.${field}`,
      passed: exists,
      message: exists ? `✓ ${field}: ${JSON.stringify(pkg[field])}` : `✗ 缺少 ${field}`,
    })
  }

  // 检查 exports
  if (pkg.exports) {
    results.push({
      name: 'package.json.exports',
      passed: true,
      message: `✓ exports 已配置`,
    })
  }

  // 检查 files
  if (pkg.files && pkg.files.length > 0) {
    results.push({
      name: 'package.json.files',
      passed: true,
      message: `✓ files 包含 ${pkg.files.length} 项`,
    })
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始验证构建...\n')

  // 检查 package.json
  await checkPackageJson()

  // 检查源文件
  await checkDirExists('src', '源代码目录')
  await checkFileExists('src/index.ts', '主入口文件')
  await checkDirExists('src/core', '核心模块')
  await checkDirExists('src/plugins', '插件模块')
  await checkDirExists('src/generators', '生成器模块')
  await checkDirExists('src/cli', 'CLI 模块')
  await checkDirExists('src/utils', '工具模块')
  await checkDirExists('src/types', '类型模块')

  // 检查模板
  await checkDirExists('templates', '模板目录')
  await checkDirExists('templates/default', '默认模板')
  await checkFileExists('templates/default/layout.ejs', 'Layout 模板')
  await checkFileExists('templates/default/component.ejs', 'Component 模板')
  await checkFileExists('templates/default/api.ejs', 'API 模板')
  await checkFileExists('templates/default/markdown.ejs', 'Markdown 模板')
  await checkFileExists('templates/default/index.ejs', 'Index 模板')

  // 检查 bin
  await checkFileExists('bin/cli.js', 'CLI 可执行文件')

  // 检查配置
  await checkFileExists('tsconfig.json', 'TypeScript 配置')
  await checkFileExists('vitest.config.ts', 'Vitest 配置')

  // 检查文档
  await checkFileExists('README.md', 'README 文档')
  await checkFileExists('CHANGELOG.md', 'CHANGELOG 文档')

  // 检查测试
  await checkDirExists('__tests__', '测试目录')

  // 输出结果
  console.log('\n📊 验证结果:\n')

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`${icon} ${result.message}`)
  })

  console.log(`\n总计: ${passed} 通过, ${failed} 失败\n`)

  if (failed > 0) {
    console.error('❌ 验证失败，请修复上述问题')
    process.exit(1)
  } else {
    console.log('✅ 验证通过！项目结构完整，可以进行打包\n')
  }
}

main().catch((error) => {
  console.error('验证过程出错:', error)
  process.exit(1)
})




