/**
 * 搜索索引构建器
 * 
 * 使用 MiniSearch 构建搜索索引
 */

import MiniSearch from 'minisearch'
import fs from 'fs-extra'
import * as path from 'path'
import type { DocNode, Logger, SearchIndexItem } from '../../types'

/**
 * 搜索索引构建器选项
 */
export interface SearchIndexBuilderOptions {
  /** 日志器 */
  logger: Logger
  /** 输出目录 */
  outputDir: string
  /** 搜索字段 */
  searchFields?: string[]
  /** 展示字段 */
  storeFields?: string[]
  /** 最小匹配长度 */
  minMatchCharLength?: number
}

/**
 * 搜索索引构建器
 */
export class SearchIndexBuilder {
  private options: SearchIndexBuilderOptions
  private logger: Logger
  private miniSearch: MiniSearch<SearchIndexItem>

  constructor(options: SearchIndexBuilderOptions) {
    this.options = {
      searchFields: ['title', 'content', 'tags'],
      storeFields: ['title', 'path', 'excerpt', 'tags'],
      minMatchCharLength: 2,
      ...options,
    }
    this.logger = options.logger

    // 初始化 MiniSearch
    this.miniSearch = new MiniSearch({
      fields: this.options.searchFields || ['title', 'content'],
      storeFields: this.options.storeFields || ['title', 'path'],
      searchOptions: {
        boost: { title: 2 },
        fuzzy: 0.2,
        prefix: true,
      },
    })
  }

  /**
   * 从文档节点构建索引
   */
  async buildFromDocs(docs: DocNode[]): Promise<void> {
    this.logger.info('开始构建搜索索引...')

    const indexItems: SearchIndexItem[] = []

    for (const doc of docs) {
      try {
        const item = this.docToIndexItem(doc)
        if (item) {
          indexItems.push(item)
        }
      } catch (error) {
        this.logger.warn(`文档索引失败 ${doc.name}:`, error)
      }
    }

    // 添加到索引
    this.miniSearch.addAll(indexItems)

    this.logger.success(`搜索索引构建完成，共 ${indexItems.length} 个条目`)
  }

  /**
   * 将文档节点转换为索引项
   */
  private docToIndexItem(doc: DocNode): SearchIndexItem | null {
    const { type, name, path: docPath, metadata, content } = doc

    // 提取标题
    let title = name
    if (metadata.title) {
      title = metadata.title
    } else if (content.frontmatter?.title) {
      title = content.frontmatter.title
    }

    // 提取内容
    let textContent = ''
    if (type === 'markdown' && content.raw) {
      textContent = this.extractTextFromMarkdown(content.raw)
    } else if (type === 'component' && content.description) {
      textContent = content.description
    } else if (type === 'api' && content.comments) {
      textContent = content.comments.map((c: any) => c.summary || c.description).filter(Boolean).join(' ')
    }

    // 生成摘要
    const excerpt = this.generateExcerpt(textContent)

    // 提取标签
    const tags = this.extractTags(doc)

    return {
      id: this.generateId(docPath),
      title,
      content: textContent,
      path: docPath,
      excerpt,
      tags,
    }
  }

  /**
   * 从 Markdown 提取纯文本
   */
  private extractTextFromMarkdown(markdown: string): string {
    return markdown
      // 移除代码块
      .replace(/```[\s\S]*?```/g, '')
      // 移除内联代码
      .replace(/`[^`]+`/g, '')
      // 移除链接
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // 移除图片
      .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
      // 移除标题标记
      .replace(/^#{1,6}\s+/gm, '')
      // 移除列表标记
      .replace(/^\s*[-*+]\s+/gm, '')
      // 移除多余空白
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * 生成摘要
   */
  private generateExcerpt(content: string, maxLength: number = 200): string {
    if (content.length <= maxLength) {
      return content
    }

    // 截取并在单词边界处结束
    const excerpt = content.substring(0, maxLength)
    const lastSpace = excerpt.lastIndexOf(' ')
    return excerpt.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...'
  }

  /**
   * 提取标签
   */
  private extractTags(doc: DocNode): string[] {
    const tags: string[] = []

    // 从元数据提取
    if (doc.metadata.tags) {
      tags.push(...doc.metadata.tags)
    }

    // 从 frontmatter 提取
    if (doc.content.frontmatter?.tags) {
      tags.push(...doc.content.frontmatter.tags)
    }

    // 添加类型标签
    tags.push(doc.type)

    return Array.from(new Set(tags))
  }

  /**
   * 生成唯一 ID
   */
  private generateId(path: string): string {
    return path.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  }

  /**
   * 搜索
   */
  search(query: string, options?: any): SearchIndexItem[] {
    const results = this.miniSearch.search(query, options)
    // MiniSearch 返回的结果需要转换为 SearchIndexItem
    return results.map(r => ({
      id: r.id,
      title: (r as any).title || '',
      content: (r as any).content || '',
      path: (r as any).path || '',
      excerpt: (r as any).excerpt,
      tags: (r as any).tags,
    }))
  }

  /**
   * 保存索引到文件
   */
  async saveIndex(filename: string = 'search-index.json'): Promise<void> {
    const outputPath = path.join(this.options.outputDir, filename)

    // 序列化索引
    const serialized = JSON.stringify(this.miniSearch, null, 2)

    await fs.ensureDir(path.dirname(outputPath))
    await fs.writeFile(outputPath, serialized, 'utf-8')

    this.logger.info(`搜索索引已保存: ${outputPath}`)
  }

  /**
   * 加载索引
   */
  async loadIndex(filename: string = 'search-index.json'): Promise<void> {
    const indexPath = path.join(this.options.outputDir, filename)

    if (!(await fs.pathExists(indexPath))) {
      throw new Error(`搜索索引文件不存在: ${indexPath}`)
    }

    const data = await fs.readFile(indexPath, 'utf-8')
    const parsed = JSON.parse(data)

    this.miniSearch = MiniSearch.loadJSON(parsed, {
      fields: this.options.searchFields || ['title', 'content'],
      storeFields: this.options.storeFields || ['title', 'path'],
    })

    this.logger.info('搜索索引已加载')
  }

  /**
   * 获取索引统计
   */
  getStats(): {
    documentCount: number
    fieldCount: number
  } {
    return {
      documentCount: this.miniSearch.documentCount,
      fieldCount: this.options.searchFields?.length || 0,
    }
  }
}


