import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from '../../src/app/store'

describe('Store', () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    store = createStore({
      siteConfig: {
        title: 'Test Site',
        description: 'Test Description',
        lang: 'zh-CN',
        darkMode: true,
      },
      themeConfig: {
        name: 'default',
      },
    })
  })

  it('should initialize with correct defaults', () => {
    expect(store.state.siteConfig.title).toBe('Test Site')
    expect(store.state.theme).toBe('light')
    expect(store.state.sidebarCollapsed).toBe(false)
    expect(store.state.searchOpen).toBe(false)
  })

  it('should toggle theme', () => {
    expect(store.state.theme).toBe('light')
    store.toggleTheme()
    expect(store.state.theme).toBe('dark')
    store.toggleTheme()
    expect(store.state.theme).toBe('light')
  })

  it('should set locale', () => {
    store.setLocale('en-US')
    expect(store.state.locale).toBe('en-US')
  })

  it('should toggle sidebar', () => {
    expect(store.state.sidebarCollapsed).toBe(false)
    store.toggleSidebar()
    expect(store.state.sidebarCollapsed).toBe(true)
  })

  it('should open and close search', () => {
    expect(store.state.searchOpen).toBe(false)
    store.openSearch()
    expect(store.state.searchOpen).toBe(true)
    store.closeSearch()
    expect(store.state.searchOpen).toBe(false)
  })
})
