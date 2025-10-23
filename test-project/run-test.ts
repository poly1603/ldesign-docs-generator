/**
 * 运行完整的文档生成测试
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import { DocsGenerator } from '../src'

async function main() {
  console.log('🧪 开始测试文档生成器...\n')

  try {
    // 1. 加载配置
    console.log('📝 步骤 1: 加载配置...')
    const configPath = path.join(__dirname, 'docs-generator.config.ts')
    const { default: config } = await import(configPath)
    console.log('✅ 配置加载成功\n')

    // 2. 创建生成器
    console.log('🔧 步骤 2: 创建文档生成器...')
    const generator = new DocsGenerator(config)
    console.log('✅ 生成器创建成功\n')

    // 3. 生成文档
    console.log('📚 步骤 3: 生成文档...')
    await generator.generate()
    console.log('✅ 文档生成成功\n')

    // 4. 验证输出
    console.log('🔍 步骤 4: 验证输出...')
    await verifyOutput(config.outputDir)
    console.log('✅ 输出验证成功\n')

    console.log('🎉 测试完成！所有功能正常工作！\n')
    console.log(`📁 文档已生成到: ${path.resolve(config.outputDir)}`)
    console.log(`\n💡 提示: 运行 "npx ldesign-docs serve -d ${config.outputDir}" 预览文档\n`)

  } catch (error) {
    console.error('\n❌ 测试失败:\n')
    console.error(error)
    process.exit(1)
  }
}

/**
 * 验证输出
 */
async function verifyOutput(outputDir: string): Promise<void> {
  const checks = [
    { file: 'index.html', desc: '首页' },
    { file: 'search-index.json', desc: '搜索索引' },
    { file: 'site.config.json', desc: '站点配置' },
    { file: 'assets/theme-variables.css', desc: '主题样式' },
  ]

  for (const check of checks) {
    const filePath = path.join(outputDir, check.file)
    const exists = await fs.pathExists(filePath)
    
    if (exists) {
      console.log(`  ✓ ${check.desc}: ${check.file}`)
    } else {
      throw new Error(`缺少文件: ${check.file}`)
    }
  }

  // 检查是否有生成的页面
  const pagesDir = path.join(outputDir, 'pages')
  if (await fs.pathExists(pagesDir)) {
    const files = await fs.readdir(pagesDir)
    console.log(`  ✓ 生成了 ${files.length} 个页面`)
  }
}

main()



