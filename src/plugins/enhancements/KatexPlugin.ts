/**
 * KaTeX 数学公式插件
 * 
 * 支持在 Markdown 中渲染数学公式
 */

import type { DocsPlugin, DocNode, ParseContext } from '../../types'

/**
 * KaTeX 插件选项
 */
export interface KatexPluginOptions {
  /** 是否启用行内公式 */
  inlineMath?: boolean
  /** 是否启用块级公式 */
  displayMath?: boolean
  /** 自定义定界符 */
  delimiters?: {
    inline?: [string, string]
    display?: [string, string]
  }
  /** KaTeX 选项 */
  katexOptions?: Record<string, any>
}

/**
 * KaTeX 插件
 */
export function katexPlugin(options: KatexPluginOptions = {}): DocsPlugin {
  const {
    inlineMath = true,
    displayMath = true,
    delimiters = {
      inline: ['$', '$'],
      display: ['$$', '$$'],
    },
    katexOptions = {},
  } = options

  return {
    name: 'katex',
    version: '1.0.0',
    description: 'KaTeX 数学公式支持',

    /**
     * 转换文档节点，处理数学公式
     */
    async transform(docs: DocNode[], context: ParseContext): Promise<DocNode[]> {
      const { logger } = context

      logger.debug('处理数学公式...')

      let formulaCount = 0

      for (const doc of docs) {
        if (doc.type === 'markdown' && doc.content.raw) {
          // 查找数学公式
          const formulas = extractMathFormulas(doc.content.raw, delimiters)

          if (formulas.length > 0) {
            formulaCount += formulas.length

            // 标记文档包含数学公式
            doc.metadata.hasKatex = true
            doc.metadata.mathFormulas = formulas

            // 转换 HTML 中的数学公式
            if (doc.content.html) {
              doc.content.html = transformMathInHTML(doc.content.html, formulas, delimiters)
            }
          }
        }
      }

      if (formulaCount > 0) {
        logger.info(`处理了 ${formulaCount} 个数学公式`)
      }

      return docs
    },

    /**
     * 生成时注入 KaTeX 脚本和样式
     */
    async afterGenerate(context): Promise<void> {
      const { docs, logger } = context

      // 检查是否有文档包含数学公式
      const hasKatex = docs.some(doc => doc.metadata.hasKatex)

      if (hasKatex) {
        logger.info('文档包含数学公式，需在模板中引入 KaTeX 库')

        // 实际使用时在模板中添加：
        // <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
        // <script src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.js"></script>
        // <script src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/contrib/auto-render.min.js"></script>
      }
    },
  }
}

/**
 * 提取数学公式
 */
function extractMathFormulas(
  markdown: string,
  delimiters: { inline?: [string, string]; display?: [string, string] }
): Array<{ type: 'inline' | 'display'; content: string }> {
  const formulas: Array<{ type: 'inline' | 'display'; content: string }> = []

  // 提取块级公式
  if (delimiters.display) {
    const [start, end] = delimiters.display
    const displayRegex = new RegExp(
      `${escapeRegex(start)}([\\s\\S]*?)${escapeRegex(end)}`,
      'g'
    )
    let match

    while ((match = displayRegex.exec(markdown)) !== null) {
      formulas.push({
        type: 'display',
        content: match[1].trim(),
      })
    }
  }

  // 提取行内公式
  if (delimiters.inline) {
    const [start, end] = delimiters.inline
    const inlineRegex = new RegExp(
      `${escapeRegex(start)}([^${escapeRegex(end)}]+)${escapeRegex(end)}`,
      'g'
    )
    let match

    while ((match = inlineRegex.exec(markdown)) !== null) {
      formulas.push({
        type: 'inline',
        content: match[1].trim(),
      })
    }
  }

  return formulas
}

/**
 * 转换 HTML 中的数学公式
 */
function transformMathInHTML(
  html: string,
  formulas: Array<{ type: 'inline' | 'display'; content: string }>,
  delimiters: { inline?: [string, string]; display?: [string, string] }
): string {
  let transformed = html

  // 转换块级公式
  if (delimiters.display) {
    const [start, end] = delimiters.display
    const displayRegex = new RegExp(
      `${escapeRegex(start)}([\\s\\S]*?)${escapeRegex(end)}`,
      'g'
    )

    transformed = transformed.replace(displayRegex, (_, content) => {
      return `<div class="math-display">${escapeHtml(content.trim())}</div>`
    })
  }

  // 转换行内公式
  if (delimiters.inline) {
    const [start, end] = delimiters.inline
    const inlineRegex = new RegExp(
      `${escapeRegex(start)}([^${escapeRegex(end)}]+)${escapeRegex(end)}`,
      'g'
    )

    transformed = transformed.replace(inlineRegex, (_, content) => {
      return `<span class="math-inline">${escapeHtml(content.trim())}</span>`
    })
  }

  return transformed
}

/**
 * 转义正则表达式
 */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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



