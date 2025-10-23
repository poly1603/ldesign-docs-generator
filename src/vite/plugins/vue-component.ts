/**
 * Vue 组件插件
 * 支持在 Markdown 中使用 Vue 组件
 */

import { Plugin } from 'vite'
import * as path from 'path'
import type { Logger } from '../../types'

/**
 * Vue 组件插件选项
 */
export interface VueComponentPluginOptions {
  /** 源目录 */
  sourceDir: string
  /** 组件目录 */
  componentsDir?: string
  /** 日志器 */
  logger: Logger
}

/**
 * 创建 Vue 组件插件
 */
export function createVueComponentPlugin(options: VueComponentPluginOptions): Plugin {
  const { sourceDir, componentsDir = path.join(sourceDir, 'components'), logger } = options

  return {
    name: 'ldesign-docs:vue-component',

    // 配置服务器
    configureServer(server) {
      // 监听组件目录
      server.watcher.add(componentsDir)
      logger.debug(`正在监听组件目录: ${componentsDir}`)
    },

    // 热更新
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.vue') && file.startsWith(componentsDir)) {
        logger.debug(`Vue 组件已更新: ${file}`)

        // 触发 HMR
        server.ws.send({
          type: 'update',
          updates: [
            {
              type: 'js-update',
              path: file,
              acceptedPath: file,
              timestamp: Date.now(),
            },
          ],
        })
      }
    },

    // 解析模块
    resolveId(id) {
      // 支持 @ 别名指向组件目录
      if (id.startsWith('@components/')) {
        return path.join(componentsDir, id.replace('@components/', ''))
      }
    },
  }
}


