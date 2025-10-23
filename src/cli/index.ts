#!/usr/bin/env node
/**
 * @ldesign/docs-generator CLI
 */

import { Command } from 'commander'
import * as path from 'path'
import * as fs from 'fs-extra'
import { DocsGenerator } from '../core/DocsGenerator'
import type { DocsGeneratorOptions } from '../types'

const program = new Command()

program
  .name('ldesign-docs')
  .description('LDesign 文档生成器 - API 文档、组件文档、交互式示例')
  .version('1.0.0')

/**
 * 生成命令
 */
program
  .command('generate')
  .alias('gen')
  .description('生成文档')
  .option('-c, --config <path>', '配置文件路径', 'docs-generator.config.js')
  .option('-s, --source <dir>', '源目录')
  .option('-o, --output <dir>', '输出目录')
  .option('-w, --watch', '监听模式')
  .option('--log-level <level>', '日志级别 (silent|error|warn|info|debug)', 'info')
  .action(async (options) => {
    try {
      console.log('🚀 开始生成文档...\n')

      // 加载配置
      const config = await loadConfig(options.config, options)

      // 创建生成器
      const generator = new DocsGenerator(config)

      // 生成文档
      await generator.generate()

      console.log('\n✨ 文档生成完成！')
      console.log(`📁 输出目录: ${config.outputDir}`)

      // 监听模式
      if (options.watch) {
        console.log('\n👀 监听模式已启用，等待文件变化...\n')

        const { watchFiles } = await import('./watcher')

        const watcher = watchFiles(
          config.sourceDir,
          async (file) => {
            console.log(`\n📝 文件变化: ${path.basename(file)}`)
            console.log('🔄 重新生成文档...\n')

            try {
              await generator.generate()
              console.log('✨ 文档已更新')
            } catch (error) {
              console.error('❌ 更新失败:', error)
            }
          },
          {
            ignore: ['node_modules', '.git', config.outputDir],
          }
        )

        // 处理退出信号
        process.on('SIGINT', () => {
          console.log('\n\n👋 停止监听...')
          watcher.stop()
          process.exit(0)
        })
      }
    } catch (error) {
      console.error('❌ 生成失败:', error)
      process.exit(1)
    }
  })

/**
 * 构建命令
 */
program
  .command('build')
  .description('构建生产版本文档')
  .option('-c, --config <path>', '配置文件路径', 'docs-generator.config.js')
  .option('-s, --source <dir>', '源目录')
  .option('-o, --output <dir>', '输出目录')
  .action(async (options) => {
    try {
      console.log('🏗️  开始构建文档...\n')

      const config = await loadConfig(options.config, options)
      const generator = new DocsGenerator(config)

      await generator.build()

      console.log('\n✨ 构建完成！')
      console.log(`📁 输出目录: ${config.outputDir}`)
    } catch (error) {
      console.error('❌ 构建失败:', error)
      process.exit(1)
    }
  })

/**
 * 预览命令
 */
program
  .command('serve')
  .description('启动开发服务器预览文档')
  .option('-p, --port <port>', '端口号', '3000')
  .option('-d, --dir <dir>', '文档目录', './docs')
  .option('--open', '自动打开浏览器')
  .action(async (options) => {
    try {
      const { startDevServer } = await import('./dev-server')

      const server = await startDevServer({
        port: parseInt(options.port),
        dir: path.resolve(process.cwd(), options.dir),
        open: options.open,
      })

      // 处理退出信号
      process.on('SIGINT', () => {
        console.log('\n\n👋 正在关闭服务器...')
        server.close(() => {
          console.log('✨ 服务器已关闭')
          process.exit(0)
        })
      })
    } catch (error) {
      console.error('❌ 启动失败:', error)
      process.exit(1)
    }
  })

/**
 * 初始化命令
 */
program
  .command('init')
  .description('初始化文档生成器配置')
  .option('-f, --force', '强制覆盖现有配置')
  .action(async (options) => {
    try {
      const configPath = path.join(process.cwd(), 'docs-generator.config.js')

      if (await fs.pathExists(configPath) && !options.force) {
        console.error('❌ 配置文件已存在，使用 --force 强制覆盖')
        process.exit(1)
      }

      const template = `import { defineConfig } from '@ldesign/docs-generator'
import { typedocPlugin, vueComponentPlugin, markdownPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  // 源目录
  sourceDir: './src',
  
  // 输出目录
  outputDir: './docs',
  
  // 插件配置
  plugins: [
    typedocPlugin({
      tsconfig: './tsconfig.json',
    }),
    vueComponentPlugin({
      include: '**/*.vue',
    }),
    markdownPlugin({
      include: '**/*.md',
    }),
  ],
  
  // 站点配置
  site: {
    title: '文档站点',
    description: '自动生成的文档站点',
    lang: 'zh-CN',
    darkMode: true,
  },
  
  // 主题配置
  theme: {
    name: 'default',
  },
  
  // 导航配置
  navigation: {
    sidebar: 'auto',
    topbar: [
      { text: '首页', link: '/' },
      { text: 'API', link: '/api/' },
      { text: '组件', link: '/components/' },
    ],
  },
})
`

      await fs.writeFile(configPath, template, 'utf-8')
      console.log('✨ 配置文件已创建:', configPath)
    } catch (error) {
      console.error('❌ 初始化失败:', error)
      process.exit(1)
    }
  })

/**
 * 清理命令
 */
program
  .command('clean')
  .description('清理输出目录')
  .option('-o, --output <dir>', '输出目录', './docs')
  .action(async (options) => {
    try {
      const outputDir = path.resolve(process.cwd(), options.output)

      if (await fs.pathExists(outputDir)) {
        await fs.remove(outputDir)
        console.log('✨ 输出目录已清理:', outputDir)
      } else {
        console.log('ℹ️  输出目录不存在:', outputDir)
      }
    } catch (error) {
      console.error('❌ 清理失败:', error)
      process.exit(1)
    }
  })

/**
 * 加载配置
 */
async function loadConfig(
  configPath: string,
  cliOptions: any
): Promise<DocsGeneratorOptions> {
  const fullPath = path.resolve(process.cwd(), configPath)

  let config: DocsGeneratorOptions | null = null

  // 尝试加载配置文件
  if (await fs.pathExists(fullPath)) {
    try {
      // 动态导入配置文件
      const module = await import(fullPath)
      config = module.default || module
      console.log(`✓ 配置文件已加载: ${configPath}`)
    } catch (error) {
      console.warn(`⚠️  配置文件加载失败: ${error}`)
    }
  }

  // 合并配置
  const finalConfig: DocsGeneratorOptions = {
    sourceDir: cliOptions.source || config?.sourceDir || './src',
    outputDir: cliOptions.output || config?.outputDir || './docs',
    plugins: config?.plugins || [],
    site: config?.site || {
      title: '文档站点',
      description: '',
    },
    theme: config?.theme,
    navigation: config?.navigation,
    logLevel: cliOptions.logLevel || config?.logLevel,
  }

  return finalConfig
}

// 解析命令行参数
program.parse()

