/**
 * Vue SPA 应用入口
 * 仅在 dev 和 spa 构建模式下使用
 */

import { createApp, type App } from 'vue'
import { createRouter, type Router } from './router'
import { createStore, type Store } from './store'
import { setupGlobalComponents } from './components'
import Layout from '../../templates/vitepress-default/layouts/Layout.vue'

/**
 * 应用实例
 */
export interface AppInstance {
  app: App
  router: Router
  store: Store
}

/**
 * 应用配置
 */
export interface AppConfig {
  /** 路由配置 */
  routes?: any[]
  /** 站点配置 */
  siteConfig?: any
  /** 主题配置 */
  themeConfig?: any
  /** 是否开发模式 */
  isDev?: boolean
}

/**
 * 创建 Vue 应用
 */
export function createViteApp(config: AppConfig = {}): AppInstance {
  const app = createApp(Layout)
  
  // 创建路由
  const router = createRouter({
    routes: config.routes || [],
    isDev: config.isDev || false,
  })
  
  // 创建状态管理
  const store = createStore({
    siteConfig: config.siteConfig,
    themeConfig: config.themeConfig,
  })
  
  // 注册全局组件
  setupGlobalComponents(app)
  
  // 安装插件
  app.use(router)
  app.use(store)
  
  // 全局属性
  app.provide('siteConfig', config.siteConfig)
  app.provide('themeConfig', config.themeConfig)
  
  return { app, router, store }
}

/**
 * 挂载应用
 */
export async function mountApp(config: AppConfig = {}): Promise<AppInstance> {
  const { app, router, store } = createViteApp(config)
  
  // 等待路由准备就绪
  await router.isReady()
  
  // 挂载到 DOM
  app.mount('#app')
  
  return { app, router, store }
}

/**
 * 客户端入口
 * 在浏览器环境下自动执行
 */
if (typeof window !== 'undefined') {
  // 从全局配置中读取配置
  const globalConfig = (window as any).__DOCS_CONFIG__ || {}
  
  mountApp(globalConfig).catch((err) => {
    console.error('应用启动失败:', err)
  })
}
