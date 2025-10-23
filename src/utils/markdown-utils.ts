/**
 * Markdown 处理工具函数
 */

import * as matter from 'gray-matter'
import type { TOCItem } from '../types'

/**
 * 提取 Frontmatter
 */
export function extractFrontmatter(content: string): {
  data: Record<string, any>
  content: string
} {
  const result = matter(content)
  return {
    data: result.data,
    content: result.content,
  }
}

/**
 * 生成 Slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // 保留中文、字母、数字
    .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
    // 移除开头和结尾的连字符
    .replace(/^-+|-+$/g, '')
    // 移除连续的连字符
    .replace(/-{2,}/g, '-')
}

/**
 * 提取标题生成 TOC
 */
export function extractHeadings(markdown: string): TOCItem[] {
  const toc: TOCItem[] = []
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const stack: Array<{ item: TOCItem; level: number }> = []

  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const title = match[2].trim()
    const slug = generateSlug(title)

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

  return toc
}

/**
 * 提取代码块
 */
export function extractCodeBlocks(markdown: string): Array<{
  language: string
  code: string
}> {
  const blocks: Array<{ language: string; code: string }> = []
  const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g

  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    blocks.push({
      language: match[1] || '',
      code: match[2].trim(),
    })
  }

  return blocks
}

/**
 * 移除代码块
 */
export function removeCodeBlocks(markdown: string): string {
  return markdown.replace(/```[\s\S]+?```/g, '')
}

/**
 * 提取链接
 */
export function extractLinks(markdown: string): Array<{
  text: string
  url: string
}> {
  const links: Array<{ text: string; url: string }> = []
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g

  let match: RegExpExecArray | null

  while ((match = linkRegex.exec(markdown)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
    })
  }

  return links
}

/**
 * 统计字数（中英文）
 */
export function countWords(markdown: string): number {
  // 移除代码块和链接
  const text = removeCodeBlocks(markdown)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // 中文字符
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []

  // 英文单词
  const englishWords = text
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0)

  return chineseChars.length + englishWords.length
}

/**
 * 估算阅读时间（分钟）
 */
export function estimateReadingTime(markdown: string): number {
  const words = countWords(markdown)
  // 假设每分钟阅读 200 个字
  return Math.ceil(words / 200)
}




