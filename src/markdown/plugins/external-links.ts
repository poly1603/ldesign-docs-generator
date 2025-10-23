/**
 * 外部链接插件
 * 为外部链接自动添加图标和 target="_blank"
 */

import type MarkdownIt from 'markdown-it'

/**
 * 外部链接配置
 */
export interface ExternalLinksConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 是否在新窗口打开 */
  openInNewTab?: boolean
  /** 是否添加图标 */
  showIcon?: boolean
  /** 自定义图标 */
  icon?: string
  /** 排除的域名（不视为外部链接）*/
  excludeDomains?: string[]
}

/**
 * 应用外部链接插件
 */
export function applyExternalLinks(md: MarkdownIt, config: ExternalLinksConfig = {}): void {
  if (config.enabled === false) {
    return
  }

  const {
    openInNewTab = true,
    showIcon = true,
    icon = '↗',
    excludeDomains = [],
  } = config

  // 保存原始的链接渲染规则
  const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

  // 重写链接渲染规则
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const hrefIndex = token.attrIndex('href')

    if (hrefIndex >= 0) {
      const href = token.attrs![hrefIndex][1]

      // 检查是否是外部链接
      if (isExternalLink(href, excludeDomains)) {
        // 添加 target="_blank" 和 rel="noopener noreferrer"
        if (openInNewTab) {
          token.attrSet('target', '_blank')
          token.attrSet('rel', 'noopener noreferrer')
        }

        // 添加外部链接类名
        const classIndex = token.attrIndex('class')
        if (classIndex >= 0) {
          token.attrs![classIndex][1] += ' external-link'
        } else {
          token.attrPush(['class', 'external-link'])
        }
      }
    }

    return defaultRender(tokens, idx, options, env, self)
  }

  // 如果需要显示图标，修改链接内容
  if (showIcon) {
    const defaultLinkClose = md.renderer.rules.link_close || function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }

    md.renderer.rules.link_close = (tokens, idx, options, env, self) => {
      const openToken = tokens[idx - 2]
      
      if (openToken && openToken.type === 'link_open') {
        const hrefIndex = openToken.attrIndex('href')
        if (hrefIndex >= 0) {
          const href = openToken.attrs![hrefIndex][1]
          if (isExternalLink(href, excludeDomains)) {
            return `<span class="external-link-icon">${icon}</span>${defaultLinkClose(tokens, idx, options, env, self)}`
          }
        }
      }

      return defaultLinkClose(tokens, idx, options, env, self)
    }
  }
}

/**
 * 判断是否是外部链接
 */
function isExternalLink(href: string, excludeDomains: string[]): boolean {
  // 排除内部链接和锚点
  if (href.startsWith('#') || href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
    return false
  }

  // 检查是否是 http(s) 协议
  if (!href.match(/^https?:\/\//)) {
    return false
  }

  // 检查是否在排除列表中
  try {
    const url = new URL(href)
    return !excludeDomains.some((domain) => url.hostname.includes(domain))
  } catch {
    return false
  }
}

/**
 * 外部链接样式
 */
export const externalLinksStyles = `
a.external-link {
  color: #42b983;
  text-decoration: none;
  transition: color 0.2s;
}

a.external-link:hover {
  color: #33a06f;
  text-decoration: underline;
}

.external-link-icon {
  margin-left: 0.25em;
  font-size: 0.85em;
  opacity: 0.7;
  vertical-align: super;
}

/* 暗黑模式 */
@media (prefers-color-scheme: dark) {
  a.external-link {
    color: #42b983;
  }

  a.external-link:hover {
    color: #5bd19d;
  }
}
`


