/**
 * 路由数据生成器
 * 将 ParserSystem 解析的 DocNode[] 转换为路由配置和元数据
 */

import type { DocNode, SidebarItem, NavItem } from '../types'
import * as path from 'path'

/**
 * 路由数据
 */
export interface RouteData {
  /** 路由记录 */
  routes: RouteRecord[]
  /** 侧边栏配置 */
  sidebar: SidebarItem[]
  /** 导航栏配置 */
  navbar: NavItem[]
  /** 搜索索引数据 */
  searchIndex: SearchIndexItem[]
}

/**
 * 路由记录
 */
export interface RouteRecord {
  path: string
  name: string
  type: string
  filepath: string
  metadata: Record<string, any>
}

/**
 * 搜索索引项
 */
export interface SearchIndexItem {
  id: string
  title: string
  path: string
  content: string
  tags: string[]
}

/**
 * 从 DocNode[] 生成路由数据
 */
export async function generateRouteData(docs: DocNode[]): Promise<RouteData> {
  const routes = generateRoutes(docs)
  const sidebar = generateSidebar(docs)
  const navbar = generateNavbar(docs)
  const searchIndex = generateSearchIndex(docs)

  return {
    routes,
    sidebar,
    navbar,
    searchIndex,
  }
}

/**
 * 生成路由记录
 */
function generateRoutes(docs: DocNode[]): RouteRecord[] {
  return docs.map(doc => {
    const routePath = doc.outputPath
      ? '/' + doc.outputPath.replace(/\.html$/, '').replace(/\\/g, '/')
      : '/' + doc.path.replace(/\.md$/, '').replace(/\\/g, '/')

    return {
      path: routePath,
      name: doc.name,
      type: doc.type,
      filepath: doc.path,
      metadata: doc.metadata,
    }
  })
}

/**
 * 生成侧边栏配置
 * 根据文档路径自动构建层级结构
 */
function generateSidebar(docs: DocNode[]): SidebarItem[] {
  const sidebar: SidebarItem[] = []
  const pathMap = new Map<string, SidebarItem>()

  // 按路径排序
  const sortedDocs = [...docs].sort((a, b) => a.path.localeCompare(b.path))

  for (const doc of sortedDocs) {
    const parts = doc.path.split(/[/\\]/).filter(Boolean)
    let current = sidebar

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts.slice(0, i + 1).join('/')
      let group = pathMap.get(part)

      if (!group) {
        group = {
          text: parts[i],
          items: [],
          collapsed: false,
        }
        pathMap.set(part, group)
        current.push(group)
      }

      current = group.items!
    }

    // 添加文档项
    current.push({
      text: doc.name,
      link: doc.outputPath
        ? '/' + doc.outputPath.replace(/\.html$/, '')
        : '/' + doc.path.replace(/\.md$/, ''),
    })
  }

  return sidebar
}

/**
 * 生成导航栏配置
 * 提取顶层目录作为导航项
 */
function generateNavbar(docs: DocNode[]): NavItem[] {
  const topLevelDirs = new Set<string>()

  for (const doc of docs) {
    const parts = doc.path.split(/[/\\]/)
    if (parts.length > 1) {
      topLevelDirs.add(parts[0])
    }
  }

  return Array.from(topLevelDirs).map(dir => ({
    text: capitalizeFirst(dir),
    link: `/${dir}/`,
  }))
}

/**
 * 生成搜索索引
 */
function generateSearchIndex(docs: DocNode[]): SearchIndexItem[] {
  return docs.map((doc, index) => {
    // 提取文本内容
    let content = ''
    if (doc.type === 'markdown' && (doc.content as any).raw) {
      content = (doc.content as any).raw
    } else if (doc.content) {
      content = JSON.stringify(doc.content)
    }

    // 提取标签
    const tags: string[] = [doc.type]
    if (doc.metadata.tags) {
      tags.push(...doc.metadata.tags)
    }

    return {
      id: `doc-${index}`,
      title: doc.name,
      path: doc.outputPath
        ? '/' + doc.outputPath.replace(/\.html$/, '')
        : '/' + doc.path.replace(/\.md$/, ''),
      content: content.slice(0, 500), // 限制长度
      tags,
    }
  })
}

/**
 * 首字母大写
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 写入路由数据到缓存
 */
export async function writeRouteData(
  routeData: RouteData,
  cacheDir: string
): Promise<void> {
  const fs = await import('fs-extra')
  const routeDataPath = path.join(cacheDir, 'routes.json')

  await fs.ensureDir(cacheDir)
  await fs.writeJSON(routeDataPath, routeData, { spaces: 2 })
}

/**
 * 读取路由数据从缓存
 */
export async function readRouteData(cacheDir: string): Promise<RouteData | null> {
  const fs = await import('fs-extra')
  const routeDataPath = path.join(cacheDir, 'routes.json')

  if (await fs.pathExists(routeDataPath)) {
    return fs.readJSON(routeDataPath)
  }

  return null
}
