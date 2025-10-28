/**
 * Vite 虚拟模块插件 - 路由数据提供
 * 提供虚拟模块 @ldesign/routes，让客户端可以动态导入路由数据
 */

import type { Plugin } from 'vite'
import type { RouteData } from '../../app/route-data-generator'

/**
 * 创建路由数据插件
 */
export function createRouteDataPlugin(routeData: RouteData): Plugin {
  const virtualModuleId = '@ldesign/routes'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'ldesign-docs:route-data',

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        // 生成 ES 模块代码
        return `export default ${JSON.stringify(routeData, null, 2)}`
      }
    },

    // HMR 支持
    handleHotUpdate({ file, server }) {
      // 当路由数据文件变化时，触发全量刷新
      if (file.includes('routes.json') || file.includes('.cache')) {
        console.log('[ldesign-docs] Route data changed, reloading...')
        server.ws.send({
          type: 'full-reload',
          path: '*',
        })
      }
    },
  }
}

/**
 * 创建文档数据插件
 * 提供虚拟模块 @ldesign/docs 来访问所有文档节点
 */
export function createDocNodeDataPlugin(docs: any[]): Plugin {
  const virtualModuleId = '@ldesign/docs'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'ldesign-docs:doc-node-data',

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        // 只暴露必要的元数据，不包含完整内容（避免打包过大）
        const metadata = docs.map(doc => ({
          type: doc.type,
          name: doc.name,
          path: doc.path,
          outputPath: doc.outputPath,
          metadata: doc.metadata,
        }))

        return `export default ${JSON.stringify(metadata, null, 2)}`
      }
    },
  }
}
