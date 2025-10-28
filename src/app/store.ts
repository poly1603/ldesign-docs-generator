/**
 * 全局状态管理
 * 使用 Vue 3 Composition API 实现轻量级状态管理
 */

import { reactive, readonly, type App, type Plugin } from 'vue'
import type { SiteConfig, ThemeConfig } from '../types'

/**
 * 状态接口
 */
export interface State {
  /** 站点配置 */
  siteConfig: SiteConfig
  /** 主题配置 */
  themeConfig: ThemeConfig
  /** 当前主题模式 */
  theme: 'light' | 'dark'
  /** 当前语言 */
  locale: string
  /** 侧边栏是否折叠 */
  sidebarCollapsed: boolean
  /** 搜索是否打开 */
  searchOpen: boolean
}

/**
 * Store 接口
 */
export interface Store extends Plugin {
  state: State
  setTheme(theme: 'light' | 'dark'): void
  toggleTheme(): void
  setLocale(locale: string): void
  toggleSidebar(): void
  openSearch(): void
  closeSearch(): void
}

/**
 * 创建 Store
 */
export function createStore(config: { 
  siteConfig?: any
  themeConfig?: any 
} = {}): Store {
  // 创建响应式状态
  const state = reactive<State>({
    siteConfig: config.siteConfig || {
      title: '文档站点',
      description: '',
      lang: 'zh-CN',
      darkMode: true,
    },
    themeConfig: config.themeConfig || {
      name: 'default',
    },
    theme: 'light',
    locale: config.siteConfig?.lang || 'zh-CN',
    sidebarCollapsed: false,
    searchOpen: false,
  })

  // 初始化主题
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('vitepress-theme') as 'light' | 'dark' | null
    if (savedTheme) {
      state.theme = savedTheme
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      state.theme = 'dark'
    }
    
    // 应用主题到 DOM
    applyTheme(state.theme)
  }

  // Actions
  function setTheme(theme: 'light' | 'dark') {
    state.theme = theme
    if (typeof window !== 'undefined') {
      localStorage.setItem('vitepress-theme', theme)
      applyTheme(theme)
    }
  }

  function toggleTheme() {
    setTheme(state.theme === 'light' ? 'dark' : 'light')
  }

  function setLocale(locale: string) {
    state.locale = locale
    if (typeof window !== 'undefined') {
      localStorage.setItem('vitepress-locale', locale)
    }
  }

  function toggleSidebar() {
    state.sidebarCollapsed = !state.sidebarCollapsed
  }

  function openSearch() {
    state.searchOpen = true
  }

  function closeSearch() {
    state.searchOpen = false
  }

  // 应用主题到 DOM
  function applyTheme(theme: 'light' | 'dark') {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
    }
  }

  // Vue 插件安装方法
  const install = (app: App) => {
    app.provide('store', {
      state: readonly(state),
      setTheme,
      toggleTheme,
      setLocale,
      toggleSidebar,
      openSearch,
      closeSearch,
    })
  }

  return {
    state: readonly(state) as State,
    setTheme,
    toggleTheme,
    setLocale,
    toggleSidebar,
    openSearch,
    closeSearch,
    install,
  }
}

/**
 * 在组件中使用 Store
 */
export function useStore(): Omit<Store, 'install'> {
  const store = inject<Omit<Store, 'install'>>('store')
  if (!store) {
    throw new Error('Store not provided. Make sure to install the store plugin.')
  }
  return store
}

// 导出类型
export type { State, Store }

import { inject } from 'vue'
