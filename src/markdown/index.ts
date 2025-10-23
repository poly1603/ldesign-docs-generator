/**
 * Markdown 增强功能集成
 * 统一导出所有 Markdown 插件和配置
 */

import type MarkdownIt from 'markdown-it'
import type { MarkdownConfig } from '../types'

// 导入所有插件
import { applyContainers, containerStyles, type ContainersConfig } from './containers'
import { applyLineNumbers, lineNumbersStyles } from './plugins/line-numbers'
import { applyHighlightLines, highlightLinesStyles } from './plugins/highlight-lines'
import { applyCodeGroups, codeGroupStyles, codeGroupScript } from './plugins/code-groups'
import { applyEmoji } from './plugins/emoji'
import { applyAnchor, anchorStyles } from './plugins/anchor'
import { applyImportCode } from './plugins/import-code'
import { applyExternalLinks, externalLinksStyles } from './plugins/external-links'

/**
 * 应用所有 Markdown 增强功能
 */
export function applyMarkdownEnhancements(
  md: MarkdownIt,
  config: MarkdownConfig = {},
  sourceDir: string
): void {
  // 1. 容器语法
  if (config.containers !== false) {
    applyContainers(md, config.containersConfig)
  }

  // 2. 代码行号
  if (config.lineNumbers !== false) {
    applyLineNumbers(md, { enabled: true })
  }

  // 3. 代码行高亮
  applyHighlightLines(md)

  // 4. 代码组
  applyCodeGroups(md)

  // 5. Emoji
  if (config.emoji !== false) {
    applyEmoji(md, { enabled: true })
  }

  // 6. 锚点
  if (config.anchor !== false) {
    applyAnchor(md, { enabled: true })
  }

  // 7. 代码导入
  applyImportCode(md, { enabled: true, sourceDir })

  // 8. 外部链接
  applyExternalLinks(md, {
    enabled: true,
    openInNewTab: true,
    showIcon: true,
  })
}

/**
 * 获取所有 Markdown 样式
 */
export function getMarkdownStyles(): string {
  return `
${containerStyles}

${lineNumbersStyles}

${highlightLinesStyles}

${codeGroupStyles}

${anchorStyles}

${externalLinksStyles}
`
}

/**
 * 获取所有客户端脚本
 */
export function getMarkdownScripts(): string {
  return codeGroupScript
}

// 导出所有插件
export {
  applyContainers,
  applyLineNumbers,
  applyHighlightLines,
  applyCodeGroups,
  applyEmoji,
  applyAnchor,
  applyImportCode,
  applyExternalLinks,
}

// 导出类型
export type { ContainersConfig }


