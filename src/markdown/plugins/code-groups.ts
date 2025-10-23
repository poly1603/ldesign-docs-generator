/**
 * 代码组插件
 * 支持多个代码块 tab 切换
 */

import type MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'

/**
 * 应用代码组插件
 */
export function applyCodeGroups(md: MarkdownIt): void {
  md.use(container, 'code-group', {
    render(tokens: any[], idx: number): string {
      const token = tokens[idx]

      if (token.nesting === 1) {
        // 开始标签 - 收集代码块标题
        const tabs: string[] = []
        let i = idx + 1

        // 查找所有代码块并提取标题
        while (i < tokens.length && tokens[i].nesting !== -1) {
          if (tokens[i].type === 'fence' && tokens[i].tag === 'code') {
            const info = tokens[i].info.trim()
            const title = extractCodeTitle(info) || getLanguageName(info)
            tabs.push(title)
          }
          i++
        }

        // 生成 tabs
        const tabsHtml = tabs
          .map((title, index) => {
            const active = index === 0 ? ' active' : ''
            return `<button class="code-group-tab${active}" data-tab="${index}">${escapeHtml(title)}</button>`
          })
          .join('')

        return `<div class="code-group">
  <div class="code-group-tabs">${tabsHtml}</div>
  <div class="code-group-blocks">`
      } else {
        // 结束标签
        return `  </div>
</div>`
      }
    },
  })

  // 修改代码块渲染，为代码组中的块添加包装
  const fence = md.renderer.rules.fence!
  let inCodeGroup = false
  let blockIndex = 0

  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]

    // 检查是否在代码组中
    let i = idx - 1
    inCodeGroup = false
    while (i >= 0) {
      if (tokens[i].type === 'container_code-group_open') {
        inCodeGroup = true
        break
      }
      if (tokens[i].type === 'container_code-group_close') {
        break
      }
      i--
    }

    // 渲染代码块
    const code = fence(tokens, idx, options, env, slf)

    if (!inCodeGroup) {
      return code
    }

    // 在代码组中 - 添加包装和索引
    const isActive = blockIndex === 0
    blockIndex++

    return `<div class="code-group-block${isActive ? ' active' : ''}" data-block="${blockIndex - 1}">
  ${code}
</div>`
  }
}

/**
 * 提取代码块标题
 * 例如: ts title="config.ts" => config.ts
 */
function extractCodeTitle(info: string): string | null {
  const match = info.match(/title="([^"]+)"/)
  return match ? match[1] : null
}

/**
 * 获取语言名称
 */
function getLanguageName(info: string): string {
  const lang = info.split(/\s+/)[0]
  const langMap: Record<string, string> = {
    ts: 'TypeScript',
    js: 'JavaScript',
    vue: 'Vue',
    jsx: 'JSX',
    tsx: 'TSX',
    css: 'CSS',
    scss: 'SCSS',
    html: 'HTML',
    json: 'JSON',
    md: 'Markdown',
    bash: 'Bash',
    sh: 'Shell',
    py: 'Python',
    go: 'Go',
    rust: 'Rust',
    java: 'Java',
  }
  return langMap[lang] || lang.toUpperCase()
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
 * 代码组样式
 */
export const codeGroupStyles = `
.code-group {
  margin: 1.5em 0;
  border-radius: 6px;
  overflow: hidden;
  background: #1e1e1e;
}

.code-group-tabs {
  display: flex;
  background: #252526;
  border-bottom: 1px solid #3e3e42;
  overflow-x: auto;
}

.code-group-tab {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #999;
  font-size: 0.9em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
}

.code-group-tab:hover {
  color: #ddd;
  background: rgba(255, 255, 255, 0.05);
}

.code-group-tab.active {
  color: #42b983;
  border-bottom-color: #42b983;
  background: #1e1e1e;
}

.code-group-blocks {
  position: relative;
}

.code-group-block {
  display: none;
}

.code-group-block.active {
  display: block;
}

.code-group-block pre {
  margin: 0;
  border-radius: 0;
}

/* 代码组 JavaScript 交互 */
.code-group-tabs::-webkit-scrollbar {
  height: 4px;
}

.code-group-tabs::-webkit-scrollbar-track {
  background: #252526;
}

.code-group-tabs::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 2px;
}

.code-group-tabs::-webkit-scrollbar-thumb:hover {
  background: #555;
}
`

/**
 * 代码组 JavaScript（客户端）
 */
export const codeGroupScript = `
// 代码组 tab 切换
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.code-group').forEach(group => {
    const tabs = group.querySelectorAll('.code-group-tab')
    const blocks = group.querySelectorAll('.code-group-block')

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        // 移除所有 active
        tabs.forEach(t => t.classList.remove('active'))
        blocks.forEach(b => b.classList.remove('active'))

        // 添加当前 active
        tab.classList.add('active')
        blocks[index].classList.add('active')
      })
    })
  })
})
`


