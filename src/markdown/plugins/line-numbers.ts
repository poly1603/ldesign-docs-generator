/**
 * 代码行号插件
 * 为代码块添加行号显示
 */

import type MarkdownIt from 'markdown-it'

/**
 * 行号配置
 */
export interface LineNumbersConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 起始行号 */
  start?: number
}

/**
 * 应用行号插件
 */
export function applyLineNumbers(md: MarkdownIt, config: LineNumbersConfig = {}): void {
  if (config.enabled === false) {
    return
  }

  const fence = md.renderer.rules.fence!

  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''
    const langName = info.split(/\s+/g)[0]

    // 检查是否禁用行号
    if (info.includes(':no-line-numbers')) {
      return fence(tokens, idx, options, env, slf)
    }

    const rawCode = token.content
    const lines = rawCode.split('\n')
    const lineCount = lines[lines.length - 1] === '' ? lines.length - 1 : lines.length

    // 生成行号
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + (config.start || 1))
      .map((num) => `<span class="line-number">${num}</span>`)
      .join('\n')

    // 生成原始代码块
    const code = fence(tokens, idx, options, env, slf)

    // 包装代码块和行号
    return `<div class="code-block-wrapper line-numbers-mode">
  <div class="line-numbers-wrapper" aria-hidden="true">${lineNumbers}</div>
  ${code}
</div>`
  }
}

/**
 * 行号样式
 */
export const lineNumbersStyles = `
.code-block-wrapper.line-numbers-mode {
  position: relative;
  padding-left: 3.5rem;
  margin: 1em 0;
}

.line-numbers-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3.5rem;
  padding: 1.25rem 0;
  text-align: center;
  font-size: 0.85em;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.3);
  background-color: rgba(0, 0, 0, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  user-select: none;
}

.line-numbers-wrapper .line-number {
  display: block;
  transition: color 0.2s;
}

.code-block-wrapper pre {
  margin: 0;
  border-radius: 0 6px 6px 0;
}

@media (max-width: 768px) {
  .code-block-wrapper.line-numbers-mode {
    padding-left: 2.5rem;
  }

  .line-numbers-wrapper {
    width: 2.5rem;
    font-size: 0.75em;
  }
}
`


