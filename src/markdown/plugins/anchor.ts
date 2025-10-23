/**
 * 锚点插件
 * 为标题自动生成锚点，支持自定义锚点 {#custom}
 */

import type MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'

/**
 * 锚点配置
 */
export interface AnchorConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 锚点前缀 */
  permalink?: boolean
  /** 锚点符号 */
  permalinkSymbol?: string
  /** 锚点位置 */
  permalinkBefore?: boolean
  /** 生成 slug 的函数 */
  slugify?: (str: string) => string
}

/**
 * 默认 slugify 函数
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * 应用锚点插件
 */
export function applyAnchor(md: MarkdownIt, config: AnchorConfig = {}): void {
  if (config.enabled === false) {
    return
  }

  // 应用 markdown-it-anchor
  md.use(anchor, {
    permalink: config.permalink !== false,
    permalinkSymbol: config.permalinkSymbol || '#',
    permalinkBefore: config.permalinkBefore !== false,
    slugify: config.slugify || slugify,
    permalinkClass: 'header-anchor',
    permalinkAttrs: (slug: string) => ({
      'aria-label': `Permalink to "${slug}"`,
    }),
  })

  // 支持自定义锚点 {#custom-id}
  md.core.ruler.push('custom_anchor', (state) => {
    const tokens = state.tokens

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'heading_open') {
        const inline = tokens[i + 1]
        if (inline && inline.type === 'inline') {
          const match = inline.content.match(/\s*\{#([^}]+)\}\s*$/)
          if (match) {
            const customId = match[1]
            // 移除自定义 ID 语法
            inline.content = inline.content.replace(/\s*\{#[^}]+\}\s*$/, '')
            // 设置自定义 ID
            tokens[i].attrSet('id', customId)
          }
        }
      }
    }
  })
}

/**
 * 锚点样式
 */
export const anchorStyles = `
.header-anchor {
  float: left;
  margin-left: -0.87em;
  padding-right: 0.23em;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s;
  text-decoration: none;
  color: #42b983;
}

.header-anchor:hover {
  text-decoration: none;
}

h1:hover .header-anchor,
h2:hover .header-anchor,
h3:hover .header-anchor,
h4:hover .header-anchor,
h5:hover .header-anchor,
h6:hover .header-anchor {
  opacity: 1;
}

@media (max-width: 768px) {
  .header-anchor {
    display: none;
  }
}
`


