/**
 * Algolia 搜索集成插件
 * 
 * 将文档索引上传到 Algolia
 */

import algoliasearch from 'algoliasearch'
import type { DocsPlugin, DocNode, GenerateContext, SearchIndexItem } from '../../types'

/**
 * Algolia 插件选项
 */
export interface AlgoliaPluginOptions {
  /** Algolia App ID */
  appId: string
  /** Algolia API Key（需要写权限）*/
  apiKey: string
  /** 索引名称 */
  indexName: string
  /** 是否在构建时上传 */
  upload?: boolean
  /** 自定义转换函数 */
  transform?: (doc: DocNode) => SearchIndexItem | null
}

/**
 * Algolia 插件
 */
export function algoliaPlugin(options: AlgoliaPluginOptions): DocsPlugin {
  const { appId, apiKey, indexName, upload = true, transform } = options

  // 初始化 Algolia 客户端
  const client = algoliasearch(appId, apiKey)
  const index = client.initIndex(indexName)

  return {
    name: 'algolia',
    version: '1.0.0',
    description: 'Algolia 搜索集成',

    /**
     * 生成后上传索引
     */
    async afterGenerate(context: GenerateContext) {
      if (!upload) {
        context.logger.info('Algolia 上传已禁用')
        return
      }

      const { docs, logger } = context

      try {
        logger.info('开始上传文档到 Algolia...')

        // 转换文档为索引项
        const records: SearchIndexItem[] = []
        for (const doc of docs) {
          let record: SearchIndexItem | null = null

          if (transform) {
            record = transform(doc)
          } else {
            record = defaultTransform(doc)
          }

          if (record) {
            records.push(record)
          }
        }

        // 批量上传
        await index.replaceAllObjects(records as any[], {
          autoGenerateObjectIDIfNotExist: false,
        })

        logger.success(`✨ 成功上传 ${records.length} 条记录到 Algolia`)
      } catch (error) {
        logger.error('Algolia 上传失败:', error)
        throw error
      }
    },

    /**
     * 清理时删除索引
     */
    async cleanup() {
      // 可选：清理索引
      // await index.clearObjects()
    },
  }
}

/**
 * 默认转换函数
 */
function defaultTransform(doc: DocNode): SearchIndexItem | null {
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
    textContent = extractTextFromMarkdown(content.raw)
  } else if (type === 'component' && content.description) {
    textContent = content.description
  } else if (type === 'api' && content.comments) {
    textContent = content.comments.map((c: any) => c.summary || c.description).filter(Boolean).join(' ')
  }

  // 生成摘要
  const excerpt = generateExcerpt(textContent)

  // 提取标签
  const tags: string[] = []
  if (metadata.tags) tags.push(...metadata.tags)
  if (content.frontmatter?.tags) tags.push(...content.frontmatter.tags)
  tags.push(type)

  return {
    objectID: generateId(docPath),
    id: generateId(docPath),
    title,
    content: textContent,
    path: docPath,
    excerpt,
    tags: Array.from(new Set(tags)),
  } as any
}

/**
 * 从 Markdown 提取纯文本
 */
function extractTextFromMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 生成摘要
 */
function generateExcerpt(content: string, maxLength: number = 200): string {
  if (content.length <= maxLength) {
    return content
  }

  const excerpt = content.substring(0, maxLength)
  const lastSpace = excerpt.lastIndexOf(' ')
  return excerpt.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...'
}

/**
 * 生成唯一 ID
 */
function generateId(path: string): string {
  return path.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
}



