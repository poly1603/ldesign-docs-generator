/**
 * Vue Router 配置
 * 基于现有的 DocNode 系统自动生成路由
 */

import { 
  createRouter as createVueRouter, 
  createWebHistory, 
  createMemoryHistory,
  type Router,
  type RouteRecordRaw 
} from 'vue-router'
import type { DocNode } from '../types'

/**
 * 路由配置
 */
export interface RouterConfig {
  /** 路由列表 */
  routes?: RouteRecordRaw[]
  /** 是否开发模式 */
  isDev?: boolean
  /** 基础路径 */
  base?: string
}

/**
 * 从 DocNode 生成路由
 */
export function generateRoutesFromDocs(docs: DocNode[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []
  
  for (const doc of docs) {
    // 计算路由路径
    const path = doc.outputPath 
      ? '/' + doc.outputPath.replace(/\.html$/, '').replace(/\\/g, '/')
      : '/' + doc.path.replace(/\.md$/, '').replace(/\\/g, '/')
    
    // 生成路由记录
    routes.push({
      path,
      name: doc.name,
      // 懒加载组件
      component: () => importDocComponent(doc),
      meta: {
        type: doc.type,
        metadata: doc.metadata,
        frontmatter: (doc as any).content?.frontmatter,
      },
    })
  }
  
  // 添加 404 页面
  routes.push({
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/404.vue'),
  })
  
  return routes
}

/**
 * 动态导入文档组件
 */
function importDocComponent(doc: DocNode) {
  // 根据文档类型返回不同的组件
  switch (doc.type) {
    case 'markdown':
      // Markdown 文件通过 Vite 插件转换为 Vue 组件
      return import(/* @vite-ignore */ doc.path)
    
    case 'api':
      // API 文档使用专用组件
      return import('../templates/api-doc.vue').then(m => ({
        ...m.default,
        props: { doc },
      }))
    
    case 'component':
      // 组件文档使用专用组件
      return import('../templates/component-doc.vue').then(m => ({
        ...m.default,
        props: { doc },
      }))
    
    default:
      // 自定义文档类型
      return import('../templates/custom-doc.vue').then(m => ({
        ...m.default,
        props: { doc },
      }))
  }
}

/**
 * 创建路由实例
 */
export function createRouter(config: RouterConfig = {}): Router {
  const { routes = [], isDev = false, base = '/' } = config
  
  const router = createVueRouter({
    // 开发模式使用 HTML5 History，SSR 使用 Memory History
    history: typeof window !== 'undefined' 
      ? createWebHistory(base)
      : createMemoryHistory(base),
    
    routes,
    
    // 滚动行为
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      }
      
      // 如果有 hash，滚动到对应元素
      if (to.hash) {
        return {
          el: to.hash,
          behavior: 'smooth',
        }
      }
      
      // 否则滚动到顶部
      return { top: 0 }
    },
  })
  
  // 全局前置守卫
  router.beforeEach((to, from, next) => {
    // 更新页面标题
    if (to.meta.frontmatter?.title) {
      document.title = `${to.meta.frontmatter.title} | ${(window as any).__DOCS_CONFIG__?.siteConfig?.title || '文档'}`
    }
    
    next()
  })
  
  // 开发模式下添加调试信息
  if (isDev) {
    router.beforeEach((to, from, next) => {
      console.log('[Router] Navigating to:', to.path)
      next()
    })
  }
  
  return router
}

/**
 * 路由热更新
 * 在开发模式下，当文件变化时更新路由
 */
export function setupRouterHMR(router: Router, docs: DocNode[]) {
  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      // 重新生成路由
      const newRoutes = generateRoutesFromDocs(docs)
      
      // 清除旧路由
      router.getRoutes().forEach(route => {
        if (route.name) {
          router.removeRoute(route.name)
        }
      })
      
      // 添加新路由
      newRoutes.forEach(route => {
        router.addRoute(route)
      })
      
      console.log('[HMR] Routes updated')
    })
  }
}
