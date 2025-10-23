/**
 * 页面导航器
 * 根据侧边栏配置自动生成上一页/下一页链接
 */

import type { SidebarConfig, SidebarItem } from '../../types'

/**
 * 页面导航链接
 */
export interface PageNavLink {
  text: string
  link: string
}

/**
 * 页面导航
 */
export interface PageNavigation {
  prev: PageNavLink | null
  next: PageNavLink | null
}

/**
 * 页面导航器
 */
export class PageNavigator {
  private sidebarConfig: SidebarConfig

  constructor(sidebarConfig: SidebarConfig) {
    this.sidebarConfig = sidebarConfig
  }

  /**
   * 获取页面的导航链接
   */
  getNavigation(currentPath: string): PageNavigation {
    // 展平侧边栏配置
    const flatItems = this.flattenSidebar(this.sidebarConfig)

    // 查找当前页面的索引
    const currentIndex = flatItems.findIndex((item) => item.link === currentPath)

    if (currentIndex === -1) {
      return { prev: null, next: null }
    }

    // 获取上一页和下一页
    const prev = currentIndex > 0 ? flatItems[currentIndex - 1] : null
    const next = currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null

    return {
      prev: prev ? { text: prev.text, link: prev.link! } : null,
      next: next ? { text: next.text, link: next.link! } : null,
    }
  }

  /**
   * 展平侧边栏配置为一维数组
   */
  private flattenSidebar(config: SidebarConfig): SidebarItem[] {
    const items: SidebarItem[] = []

    function flatten(sidebarItems: SidebarItem[]) {
      for (const item of sidebarItems) {
        if (item.link) {
          items.push(item)
        }
        if (item.items) {
          flatten(item.items)
        }
      }
    }

    if (Array.isArray(config)) {
      flatten(config)
    } else {
      // 如果是对象，遍历所有路径的配置
      Object.values(config).forEach((sidebarItems) => {
        flatten(sidebarItems)
      })
    }

    return items
  }

  /**
   * 根据路径获取对应的侧边栏配置
   */
  private getSidebarForPath(path: string, config: SidebarConfig): SidebarItem[] {
    if (Array.isArray(config)) {
      return config
    }

    // 查找匹配的侧边栏配置
    const matchedPath = Object.keys(config)
      .sort((a, b) => b.length - a.length) // 按长度降序排序，优先匹配更具体的路径
      .find((key) => path.startsWith(key))

    return matchedPath ? config[matchedPath] : []
  }
}

/**
 * 创建页面导航器
 */
export function createPageNavigator(sidebarConfig: SidebarConfig): PageNavigator {
  return new PageNavigator(sidebarConfig)
}


