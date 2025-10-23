/**
 * 配置文件热重载插件
 * 监听配置文件变化并自动重启服务器
 */

import { Plugin } from 'vite'
import * as path from 'path'
import type { Logger } from '../../types'

/**
 * 配置热重载插件选项
 */
export interface ConfigHotReloadPluginOptions {
  /** 配置文件路径 */
  configFile?: string
  /** 日志器 */
  logger: Logger
}

/**
 * 创建配置热重载插件
 */
export function createConfigHotReloadPlugin(options: ConfigHotReloadPluginOptions): Plugin {
  const { configFile, logger } = options

  return {
    name: 'ldesign-docs:config-hot-reload',

    // 处理热更新
    handleHotUpdate({ file, server }) {
      // 检查是否是配置文件
      if (configFile && file === path.resolve(configFile)) {
        logger.info('配置文件已更新，正在重启服务器...')

        // 重启服务器
        server.restart()

        return []
      }
    },

    // 配置服务器
    configureServer(server) {
      // 监听配置文件
      if (configFile) {
        server.watcher.add(configFile)
        logger.debug(`正在监听配置文件: ${configFile}`)
      }
    },
  }
}


