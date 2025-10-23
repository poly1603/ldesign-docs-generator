/**
 * 自定义插件开发示例
 * 
 * 这是一个完整的插件开发示例，展示了如何创建自定义插件
 */

import type { DocsPlugin, ParseContext, ParseResult, DocNode } from '@ldesign/docs-generator'
import * as fs from 'fs-extra'
import * as path from 'path'

/**
 * 插件选项
 */
export interface MyPluginOptions {
  /** 包含的文件模式 */
  include?: string[]
  /** 排除的文件模式 */
  exclude?: string[]
  /** 自定义配置 */
  customConfig?: Record<string, any>
}

/**
 * 我的自定义插件
 * 
 * 此插件解析 .custom 文件并生成文档
 * 
 * @param options - 插件选项
 * @returns DocsPlugin 实例
 * 
 * @example
 * ```ts
 * import { myPlugin } from './my-plugin'
 * 
 * export default defineConfig({
 *   plugins: [
 *     myPlugin({
 *       include: ['**\/*.custom'],
 *     }),
 *   ],
 * })
 * ```
 */
export function myPlugin(options: MyPluginOptions = {}): DocsPlugin {
  const {
    include = ['**/*.custom'],
    exclude = ['**/node_modules/**'],
    customConfig = {},
  } = options

  return {
    // ============ 基本信息 ============
    name: 'my-plugin',
    version: '1.0.0',
    author: 'Your Name',
    description: '我的自定义插件示例',
    tags: ['custom', 'example'],

    // ============ 依赖关系 ============
    dependencies: [], // 如果依赖其他插件，在这里声明

    // ============ 配置 Schema ============
    configSchema: {
      type: 'object',
      properties: {
        include: {
          type: 'array',
          description: '包含的文件模式',
          default: ['**/*.custom'],
        },
        exclude: {
          type: 'array',
          description: '排除的文件模式',
          default: ['**/node_modules/**'],
        },
      },
      required: ['include'],
    },
    config: { include, exclude, customConfig },

    // ============ 生命周期钩子 ============

    /**
     * 解析前钩子
     * 
     * 用于初始化资源、验证环境等
     */
    beforeParse: async (context: ParseContext) => {
      const { logger } = context
      logger.info('MyPlugin: 准备解析...')

      // 初始化工作
      // 例如：连接数据库、加载配置等
    },

    /**
     * 解析钩子
     * 
     * 主要的解析逻辑
     */
    parse: async (context: ParseContext): Promise<ParseResult> => {
      const { files, sourceDir, logger } = context
      const nodes: DocNode[] = []
      const errors: Error[] = []

      // 过滤要处理的文件
      const customFiles = files.filter(file => {
        const relativePath = path.relative(sourceDir, file)

        // 检查 include 模式
        const included = include.some(pattern =>
          minimatch(relativePath, pattern)
        )

        // 检查 exclude 模式
        const excluded = exclude.some(pattern =>
          minimatch(relativePath, pattern)
        )

        return included && !excluded
      })

      logger.info(`MyPlugin: 找到 ${customFiles.length} 个 .custom 文件`)

      // 解析每个文件
      for (const file of customFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8')
          const parsed = parseCustomFile(content)

          nodes.push({
            type: 'custom',
            name: path.basename(file, '.custom'),
            path: file,
            metadata: {
              ...parsed.metadata,
              plugin: 'my-plugin',
              parsedAt: new Date().toISOString(),
            },
            content: parsed,
          })
        } catch (error) {
          logger.error(`解析文件失败: ${file}`, error)
          errors.push(error as Error)
        }
      }

      return {
        nodes,
        errors: errors.length > 0 ? errors : undefined,
      }
    },

    /**
     * 解析后钩子
     * 
     * 用于验证解析结果、统计信息等
     */
    afterParse: async (result: ParseResult, context: ParseContext) => {
      const { logger } = context
      logger.info(`MyPlugin: 成功解析 ${result.nodes.length} 个文档`)

      return result
    },

    /**
     * 转换前钩子
     */
    beforeTransform: async (docs: DocNode[], context: ParseContext) => {
      const { logger } = context
      logger.debug('MyPlugin: 准备转换...')
    },

    /**
     * 转换钩子
     * 
     * 转换和增强文档节点
     */
    transform: async (docs: DocNode[], context: ParseContext) => {
      const { logger } = context

      for (const doc of docs) {
        // 只处理此插件生成的文档
        if (doc.metadata.plugin !== 'my-plugin') {
          continue
        }

        // 添加额外信息
        doc.metadata.enhanced = true
        doc.metadata.wordCount = countWords(doc.content.text || '')

        // 生成摘要
        if (doc.content.text) {
          doc.metadata.summary = generateSummary(doc.content.text)
        }
      }

      return docs
    },

    /**
     * 转换后钩子
     */
    afterTransform: async (docs: DocNode[], context: ParseContext) => {
      const { logger } = context
      const myDocs = docs.filter(d => d.metadata.plugin === 'my-plugin')
      logger.info(`MyPlugin: 转换了 ${myDocs.length} 个文档`)

      return docs
    },

    /**
     * 生成前钩子
     */
    beforeGenerate: async (context) => {
      const { logger } = context
      logger.debug('MyPlugin: 准备生成...')
    },

    /**
     * 生成钩子
     * 
     * 生成额外的输出文件
     */
    generate: async (context) => {
      const { docs, outputDir, logger } = context

      // 过滤此插件的文档
      const myDocs = docs.filter(d => d.metadata.plugin === 'my-plugin')

      if (myDocs.length === 0) {
        return
      }

      // 生成索引文件
      const indexData = myDocs.map(doc => ({
        name: doc.name,
        path: doc.path,
        summary: doc.metadata.summary,
      }))

      const indexPath = path.join(outputDir, 'custom-index.json')
      await fs.writeJSON(indexPath, indexData, { spaces: 2 })

      logger.info(`MyPlugin: 生成索引文件 ${indexPath}`)
    },

    /**
     * 生成后钩子
     */
    afterGenerate: async (context) => {
      const { logger } = context
      logger.success('MyPlugin: 生成完成！')
    },

    /**
     * 清理钩子
     * 
     * 清理资源、关闭连接等
     */
    cleanup: async () => {
      // 清理工作
      // 例如：关闭数据库连接、删除临时文件等
    },
  }
}

/**
 * 解析自定义文件
 */
function parseCustomFile(content: string): any {
  // 简单的解析示例
  const lines = content.split('\n')
  const metadata: Record<string, any> = {}
  const text: string[] = []

  let inMetadata = false

  for (const line of lines) {
    if (line.trim() === '---') {
      inMetadata = !inMetadata
      continue
    }

    if (inMetadata) {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length > 0) {
        metadata[key.trim()] = valueParts.join(':').trim()
      }
    } else {
      text.push(line)
    }
  }

  return {
    metadata,
    text: text.join('\n'),
  }
}

/**
 * 统计词数
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

/**
 * 生成摘要
 */
function generateSummary(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength) + '...'
}

/**
 * 简单的 glob 匹配
 */
function minimatch(path: string, pattern: string): boolean {
  // 简化实现，实际应使用 minimatch 库
  const regex = pattern
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '.')

  return new RegExp(`^${regex}$`).test(path)
}



