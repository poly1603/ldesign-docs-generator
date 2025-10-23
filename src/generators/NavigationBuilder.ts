/**
 * 导航构建器
 */

import * as path from 'path'
import type {
  DocNode,
  Navigation,
  SidebarItem,
  NavItem,
  BreadcrumbItem,
  TOCItem,
  NavigationConfig,
  MarkdownDocNode,
  Logger,
} from '../types'

/**
 * 导航构建器选项
 */
export interface NavigationBuilderOptions {
  /** 导航配置 */
  config: NavigationConfig
  /** 日志器 */
  logger: Logger
}

/**
 * 导航构建器
 */
export class NavigationBuilder {
  private options: NavigationBuilderOptions

  constructor(options: NavigationBuilderOptions) {
    this.options = options
  }

  /**
   * 构建导航
   */
  build(docs: DocNode[]): Navigation {
    const { config } = this.options

    return {
      sidebar: this.buildSidebar(docs),
      topbar: config.topbar || [],
      breadcrumb: (path: string) => this.buildBreadcrumb(path, docs),
      toc: (doc: DocNode) => this.buildTOC(doc),
    }
  }

  /**
   * 构建侧边栏
   */
  private buildSidebar(docs: DocNode[]): SidebarItem[] {
    const { config } = this.options

    // 如果配置了侧边栏，直接使用
    if (config.sidebar && config.sidebar !== 'auto') {
      return Array.isArray(config.sidebar) ? config.sidebar : []
    }

    // 自动生成侧边栏
    return this.autoGenerateSidebar(docs)
  }

  /**
   * 自动生成侧边栏
   */
  private autoGenerateSidebar(docs: DocNode[]): SidebarItem[] {
    // 按类型分组
    const grouped = this.groupByType(docs)

    const sidebar: SidebarItem[] = []

    // API 文档
    if (grouped.api.length > 0) {
      sidebar.push({
        text: 'API 文档',
        items: this.buildAPITree(grouped.api),
      })
    }

    // 组件文档
    if (grouped.component.length > 0) {
      sidebar.push({
        text: '组件',
        items: this.buildComponentTree(grouped.component),
      })
    }

    // Markdown 文档
    if (grouped.markdown.length > 0) {
      sidebar.push({
        text: '文档',
        items: this.buildMarkdownTree(grouped.markdown),
      })
    }

    return sidebar
  }

  /**
   * 按类型分组
   */
  private groupByType(docs: DocNode[]): Record<string, DocNode[]> {
    const grouped: Record<string, DocNode[]> = {
      api: [],
      component: [],
      markdown: [],
      custom: [],
    }

    for (const doc of docs) {
      if (grouped[doc.type]) {
        grouped[doc.type].push(doc)
      }
    }

    return grouped
  }

  /**
   * 构建 API 树
   */
  private buildAPITree(docs: DocNode[]): SidebarItem[] {
    // 按模块/命名空间组织
    const tree: SidebarItem[] = []

    // 简单实现：按文件路径分组
    const byPath = this.groupByPath(docs)

    for (const [pathPrefix, items] of Object.entries(byPath)) {
      if (items.length === 1) {
        tree.push({
          text: items[0].name,
          link: `/${items[0].outputPath}`,
        })
      } else {
        tree.push({
          text: pathPrefix,
          items: items.map((doc) => ({
            text: doc.name,
            link: `/${doc.outputPath}`,
          })),
        })
      }
    }

    return tree
  }

  /**
   * 构建组件树
   */
  private buildComponentTree(docs: DocNode[]): SidebarItem[] {
    return docs
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((doc) => ({
        text: doc.name,
        link: `/${doc.outputPath}`,
      }))
  }

  /**
   * 构建 Markdown 树
   */
  private buildMarkdownTree(docs: DocNode[]): SidebarItem[] {
    // 按路径层级构建树
    const tree: SidebarItem[] = []
    const pathMap: Map<string, SidebarItem> = new Map()

    for (const doc of docs) {
      const pathParts = doc.path.split(path.sep)
      let currentLevel = tree
      let currentPath = ''

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]
        currentPath += part + '/'

        if (!pathMap.has(currentPath)) {
          const item: SidebarItem = {
            text: part,
            items: [],
          }
          pathMap.set(currentPath, item)
          currentLevel.push(item)
          currentLevel = item.items!
        } else {
          currentLevel = pathMap.get(currentPath)!.items!
        }
      }

      // 添加文件
      currentLevel.push({
        text: doc.name,
        link: `/${doc.outputPath}`,
      })
    }

    return tree
  }

  /**
   * 按路径分组
   */
  private groupByPath(docs: DocNode[]): Record<string, DocNode[]> {
    const grouped: Record<string, DocNode[]> = {}

    for (const doc of docs) {
      const pathParts = doc.path.split(path.sep)
      const prefix = pathParts.length > 1 ? pathParts[0] : 'root'

      if (!grouped[prefix]) {
        grouped[prefix] = []
      }
      grouped[prefix].push(doc)
    }

    return grouped
  }

  /**
   * 构建面包屑
   */
  private buildBreadcrumb(currentPath: string, docs: DocNode[]): BreadcrumbItem[] {
    const breadcrumb: BreadcrumbItem[] = [
      { text: '首页', link: '/' },
    ]

    const pathParts = currentPath.split('/').filter(Boolean)

    let accumulatedPath = ''
    for (const part of pathParts) {
      accumulatedPath += '/' + part

      // 查找对应的文档
      const doc = docs.find((d) => d.outputPath === accumulatedPath.slice(1))

      breadcrumb.push({
        text: doc ? doc.name : part,
        link: accumulatedPath,
      })
    }

    return breadcrumb
  }

  /**
   * 构建 TOC
   */
  private buildTOC(doc: DocNode): TOCItem[] {
    if (doc.type === 'markdown') {
      const mdDoc = doc as MarkdownDocNode
      return mdDoc.content.toc || []
    }

    // API 和组件文档的 TOC
    const toc: TOCItem[] = []

    if (doc.type === 'component') {
      toc.push({ level: 2, title: '属性 (Props)', slug: 'props' })
      toc.push({ level: 2, title: '事件 (Events)', slug: 'events' })
      toc.push({ level: 2, title: '插槽 (Slots)', slug: 'slots' })
      toc.push({ level: 2, title: '示例', slug: 'examples' })
    } else if (doc.type === 'api') {
      toc.push({ level: 2, title: '说明', slug: 'description' })
      toc.push({ level: 2, title: '签名', slug: 'signatures' })
      toc.push({ level: 2, title: '参数', slug: 'parameters' })
      toc.push({ level: 2, title: '返回值', slug: 'return' })
      toc.push({ level: 2, title: '示例', slug: 'examples' })
    }

    return toc
  }
}




