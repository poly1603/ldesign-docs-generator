#!/usr/bin/env node

/**
 * @ldesign/docs-generator CLI Entry
 */

// 检查 Node.js 版本
const nodeVersion = process.versions.node
const majorVersion = parseInt(nodeVersion.split('.')[0], 10)

if (majorVersion < 18) {
  console.error('❌ 错误: @ldesign/docs-generator 需要 Node.js 18 或更高版本')
  console.error(`当前版本: ${nodeVersion}`)
  console.error('请升级您的 Node.js 版本')
  process.exit(1)
}

// 加载 CLI
try {
  import('../dist/cli.js').catch((error) => {
    console.error('❌ CLI 启动失败:', error)
    process.exit(1)
  })
} catch (error) {
  console.error('❌ CLI 启动失败:', error)
  process.exit(1)
}
