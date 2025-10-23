/**
 * Vite 开发服务器
 * 提供快速的开发体验和热模块替换（HMR）
 */

import { createServer as createViteServer, ViteDevServer, InlineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import * as fs from 'fs-extra'
import type { Logger } from '../types'
import { createMarkdownPlugin } from './plugins/markdown'
import { createConfigHotReloadPlugin } from './plugins/config'
import { createErrorHandlerMiddleware } from './middleware/error-handler'

/**
 * 开发服务器选项
 */
export interface DevServerOptions {
  /** 源目录 */
  sourceDir: string
  /** 输出目录 */
  outputDir: string
  /** 配置文件路径 */
  configFile?: string
  /** 端口号 */
  port?: number
  /** 是否自动打开浏览器 */
  open?: boolean
  /** 是否启用 HTTPS */
  https?: boolean
  /** 日志器 */
  logger: Logger
  /** 自定义 Vite 配置 */
  vite?: InlineConfig
}

/**
 * 创建开发服务器
 */
export async function createDevServer(options: DevServerOptions): Promise<ViteDevServer> {
  const {
    sourceDir,
    outputDir,
    configFile,
    port = 3000,
    open = false,
    https = false,
    logger,
    vite: userViteConfig = {},
  } = options

  logger.info('正在启动 Vite 开发服务器...')

  // 确保输出目录存在
  await fs.ensureDir(outputDir)

  // Vite 配置
  const viteConfig: InlineConfig = {
    // 合并用户配置
    ...userViteConfig,

    // 根目录设置为输出目录
    root: outputDir,

    // 基础路径
    base: userViteConfig.base || '/',

    // 插件
    plugins: [
      // Vue 插件
      vue(),

      // Markdown 插件
      createMarkdownPlugin({
        sourceDir,
        logger,
      }),

      // 配置热重载插件
      createConfigHotReloadPlugin({
        configFile,
        logger,
      }),

      // 用户自定义插件
      ...(userViteConfig.plugins || []),
    ],

    // 服务器配置
    server: {
      port,
      open,
      https: https ? {} : undefined,
      strictPort: false,
      host: '0.0.0.0',
      cors: true,
      hmr: {
        overlay: true,
      },
      ...(userViteConfig.server || {}),
    },

    // 构建配置
    build: {
      outDir: outputDir,
      emptyOutDir: false,
      ...(userViteConfig.build || {}),
    },

    // 解析配置
    resolve: {
      alias: {
        '@': sourceDir,
        '~': outputDir,
        ...(userViteConfig.resolve?.alias || {}),
      },
      ...(userViteConfig.resolve || {}),
    },

    // 优化配置
    optimizeDeps: {
      include: ['vue', 'vue-router'],
      ...(userViteConfig.optimizeDeps || {}),
    },

    // 日志级别
    logLevel: 'info',

    // 清除屏幕
    clearScreen: false,
  }

  // 创建 Vite 服务器
  const server = await createViteServer(viteConfig)

  // 添加自定义中间件
  server.middlewares.use(createErrorHandlerMiddleware(logger))

  // 监听配置文件变化
  if (configFile && await fs.pathExists(configFile)) {
    server.watcher.add(configFile)
  }

  // 监听源文件变化
  server.watcher.add(sourceDir)

  logger.info('Vite 服务器创建完成')

  return server
}

/**
 * 启动开发服务器
 */
export async function startDevServer(options: DevServerOptions): Promise<ViteDevServer> {
  const server = await createDevServer(options)
  const { logger, port = 3000 } = options

  try {
    await server.listen()

    logger.success('\n🚀 Vite 开发服务器已启动！\n')
    logger.info(`  ➜  本地访问: http://localhost:${port}`)
    logger.info(`  ➜  网络访问: http://0.0.0.0:${port}`)
    logger.info('\n  ✨ 按 Ctrl+C 停止服务器\n')

    return server
  } catch (error) {
    logger.error('启动服务器失败:', error)
    await server.close()
    throw error
  }
}

/**
 * 停止开发服务器
 */
export async function stopDevServer(server: ViteDevServer): Promise<void> {
  await server.close()
}


