/**
 * Markdown 解析插件
 */

import * as fs from 'fs-extra'
import * as path from 'path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token'
import type {
  DocsPlugin,
  ParseContext,
  ParseResult,
  MarkdownDocNode,
  TOCItem,
} from '../../types'

/**
 * Markdown 插件选项
 */
export interface MarkdownPluginOptions {
  /** 包含的文件模式 */
  include?: string | string[]
  /** 排除的文件模式 */
  exclude?: string | string[]
  /** Markdown-it 选项 */
  markdownOptions?: MarkdownIt.Options
}

/**
 * Markdown 插件
 */
export class MarkdownPlugin implements DocsPlugin {
  name = 'markdown'
  version = '1.0.0'
  private options: MarkdownPluginOptions
  private md: MarkdownIt

  constructor(options: MarkdownPluginOptions = {}) {
    this.options = {
      include: options.include || '**/*.md',
      exclude: options.exclude || '**/node_modules/**',
      markdownOptions: options.markdownOptions,
    }

    // 初始化 Markdown-it
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      ...this.options.markdownOptions,
    })
  }

  /**
   * 解析 Markdown 文件
   */
  async parse(context: ParseContext): Promise<ParseResult> {
    const { files, sourceDir, logger } = context
    const nodes: MarkdownDocNode[] = []
    const errors: Error[] = []

    // 过滤 Markdown 文件
    const mdFiles = files.filter((file) => file.endsWith('.md'))

    logger.debug(`找到 ${mdFiles.length} 个 Markdown 文件`)

    for (const file of mdFiles) {
      try {
        const node = await this.parseMarkdownFile(file, sourceDir)
        if (node) {
          nodes.push(node)
        }
      } catch (error) {
        logger.error(`解析 Markdown 文件失败: ${file}`, error)
        errors.push(error as Error)
      }
    }

    logger.debug(`Markdown 解析完成，共 ${nodes.length} 个文档`)

    return { nodes, errors: errors.length > 0 ? errors : undefined }
  }

  /**
   * 解析单个 Markdown 文件
   */
  private async parseMarkdownFile(
    filePath: string,
    sourceDir: string
  ): Promise<MarkdownDocNode | null> {
    // 读取文件内容
    const content = await fs.readFile(filePath, 'utf-8')

    // 解析 frontmatter
    const { data: frontmatter, content: markdown } = matter(content)

    // 渲染 HTML
    const html = this.md.render(markdown)

    // 生成 TOC
    const toc = this.generateTOC(markdown)

    // 提取文档标题
    const title = this.extractTitle(markdown, frontmatter)

    // 生成输出路径
    const relativePath = path.relative(sourceDir, filePath)
    const outputPath = relativePath.replace(/\.md$/, '.html')

    // 创建 Markdown 文档节点
    const node: MarkdownDocNode = {
      type: 'markdown',
      name: title,
      path: relativePath,
      outputPath,
      metadata: {
        frontmatter,
        hasCodeBlocks: this.hasCodeBlocks(markdown),
        hasTables: this.hasTables(markdown),
        hasImages: this.hasImages(markdown),
      },
      content: {
        raw: markdown,
        html,
        frontmatter,
        toc,
      },
    }

    return node
  }

  /**
   * 生成目录 (TOC)
   */
  private generateTOC(markdown: string): TOCItem[] {
    const toc: TOCItem[] = []
    const stack: Array<{ item: TOCItem; level: number }> = []

    // 解析 tokens
    const tokens = this.md.parse(markdown, {})

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      if (token.type === 'heading_open') {
        const level = parseInt(token.tag.substring(1), 10)
        const contentToken = tokens[i + 1]

        if (contentToken && contentToken.type === 'inline') {
          const title = contentToken.content
          const slug = this.slugify(title)

          const item: TOCItem = {
            level,
            title,
            slug,
            children: [],
          }

          // 构建层级关系
          while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop()
          }

          if (stack.length === 0) {
            toc.push(item)
          } else {
            const parent = stack[stack.length - 1].item
            if (!parent.children) {
              parent.children = []
            }
            parent.children.push(item)
          }

          stack.push({ item, level })
        }
      }
    }

    return toc
  }

  /**
   * 提取标题
   */
  private extractTitle(markdown: string, frontmatter: any): string {
    // 优先使用 frontmatter 中的 title
    if (frontmatter.title) {
      return frontmatter.title
    }

    // 提取第一个 h1 标题
    const h1Match = markdown.match(/^#\s+(.+)$/m)
    if (h1Match) {
      return h1Match[1]
    }

    // 使用文件名
    return 'Untitled'
  }

  /**
   * 生成 slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * 检查是否包含代码块
   */
  private hasCodeBlocks(markdown: string): boolean {
    return /```[\s\S]*?```/.test(markdown) || /`[^`]+`/.test(markdown)
  }

  /**
   * 检查是否包含表格
   */
  private hasTables(markdown: string): boolean {
    return /^\|.+\|$/m.test(markdown)
  }

  /**
   * 检查是否包含图片
   */
  private hasImages(markdown: string): boolean {
    return /!\[.*?\]\(.+?\)/.test(markdown)
  }
}

/**
 * 创建 Markdown 插件
 */
export function markdownPlugin(
  options?: MarkdownPluginOptions
): MarkdownPlugin {
  return new MarkdownPlugin(options)
}




