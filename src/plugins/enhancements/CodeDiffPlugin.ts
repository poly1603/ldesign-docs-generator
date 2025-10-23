/**
 * 代码差异插件
 * 
 * 支持显示代码差异对比
 */

import type { DocsPlugin, DocNode, ParseContext } from '../../types'

/**
 * 代码差异插件选项
 */
export interface CodeDiffPluginOptions {
  /** 差异样式 */
  style?: 'unified' | 'split'
  /** 是否显示行号 */
  lineNumbers?: boolean
}

/**
 * 代码差异插件
 */
export function codeDiffPlugin(options: CodeDiffPluginOptions = {}): DocsPlugin {
  const { style = 'unified', lineNumbers = true } = options

  return {
    name: 'code-diff',
    version: '1.0.0',
    description: '代码差异对比',

    /**
     * 转换文档节点，处理代码差异块
     */
    async transform(docs: DocNode[], context: ParseContext): Promise<DocNode[]> {
      const { logger } = context

      logger.debug('处理代码差异...')

      for (const doc of docs) {
        if (doc.type === 'markdown' && doc.content.raw) {
          // 查找 diff 代码块
          const diffBlocks = extractDiffBlocks(doc.content.raw)

          if (diffBlocks.length > 0) {
            doc.metadata.hasDiff = true

            // 转换 HTML 中的 diff 代码块
            if (doc.content.html) {
              doc.content.html = transformDiffInHTML(doc.content.html, {
                style,
                lineNumbers,
              })
            }
          }
        }
      }

      return docs
    },
  }
}

/**
 * 提取 diff 代码块
 */
function extractDiffBlocks(markdown: string): string[] {
  const blocks: string[] = []
  const regex = /```diff\n([\s\S]*?)```/g
  let match

  while ((match = regex.exec(markdown)) !== null) {
    blocks.push(match[1].trim())
  }

  return blocks
}

/**
 * 转换 HTML 中的 diff 代码块
 */
function transformDiffInHTML(
  html: string,
  options: { style: string; lineNumbers: boolean }
): string {
  const { style, lineNumbers } = options

  return html.replace(
    /<pre><code class="language-diff">([\s\S]*?)<\/code><\/pre>/g,
    (_, code) => {
      const decodedCode = decodeHtmlEntities(code)
      const lines = decodedCode.split('\n')

      const processedLines = lines.map((line, index) => {
        let className = 'diff-line'
        let symbol = ''

        if (line.startsWith('+')) {
          className += ' diff-addition'
          symbol = '+'
        } else if (line.startsWith('-')) {
          className += ' diff-deletion'
          symbol = '-'
        } else if (line.startsWith('@@')) {
          className += ' diff-info'
        }

        const content = line.substring(symbol ? 1 : 0)
        const lineNumber = lineNumbers ? `<span class="line-number">${index + 1}</span>` : ''

        return `<div class="${className}">
          ${lineNumber}
          ${symbol ? `<span class="diff-symbol">${symbol}</span>` : ''}
          <span class="line-content">${escapeHtml(content)}</span>
        </div>`
      }).join('')

      return `<div class="code-diff code-diff-${style}">${processedLines}</div>`
    }
  )
}

/**
 * 解码 HTML 实体
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

/**
 * 转义 HTML
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}



