/**
 * 代码行高亮插件
 * 支持高亮特定行 {1,3-5}
 */

import type MarkdownIt from 'markdown-it'

/**
 * 解析行高亮配置
 * 例如: {1,3-5,7} => [1, 3, 4, 5, 7]
 */
function parseLineHighlights(info: string): number[] {
  const match = info.match(/\{([^}]+)\}/)
  if (!match) {
    return []
  }

  const ranges = match[1].split(',').map((s) => s.trim())
  const lines: number[] = []

  for (const range of ranges) {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map((n) => parseInt(n.trim(), 10))
      for (let i = start; i <= end; i++) {
        lines.push(i)
      }
    } else {
      lines.push(parseInt(range, 10))
    }
  }

  return lines
}

/**
 * 应用行高亮插件
 */
export function applyHighlightLines(md: MarkdownIt): void {
  const fence = md.renderer.rules.fence!

  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''

    // 解析高亮行
    const highlightLines = parseLineHighlights(info)

    if (highlightLines.length === 0) {
      return fence(tokens, idx, options, env, slf)
    }

    // 移除高亮配置，保留语言名称
    token.info = info.replace(/\{[^}]+\}/, '').trim()

    const rawCode = token.content
    const lines = rawCode.split('\n')

    // 为每一行添加高亮标记
    const highlightedCode = lines
      .map((line, i) => {
        const lineNum = i + 1
        const isHighlighted = highlightLines.includes(lineNum)
        return isHighlighted ? `<span class="highlighted-line">${escapeHtml(line)}</span>` : escapeHtml(line)
      })
      .join('\n')

    // 更新 token 内容
    token.content = highlightedCode

    // 渲染代码块
    const code = fence(tokens, idx, options, env, slf)

    return `<div class="code-block-with-highlights">${code}</div>`
  }
}

/**
 * HTML 转义
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 行高亮样式
 */
export const highlightLinesStyles = `
.code-block-with-highlights .highlighted-line {
  display: block;
  background-color: rgba(66, 185, 131, 0.1);
  border-left: 3px solid #42b983;
  margin-left: -1.5rem;
  padding-left: calc(1.5rem - 3px);
  margin-right: -1.5rem;
  padding-right: 1.5rem;
}

.code-block-with-highlights .highlighted-line::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #42b983;
}
`


