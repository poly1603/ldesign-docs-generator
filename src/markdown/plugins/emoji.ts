/**
 * Emoji 插件
 * 支持 :tada: 等 emoji 语法
 */

import type MarkdownIt from 'markdown-it'
import emoji from 'markdown-it-emoji'

/**
 * Emoji 配置
 */
export interface EmojiConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 自定义 emoji 映射 */
  customEmojis?: Record<string, string>
}

/**
 * 应用 Emoji 插件
 */
export function applyEmoji(md: MarkdownIt, config: EmojiConfig = {}): void {
  if (config.enabled === false) {
    return
  }

  // 应用 markdown-it-emoji
  md.use(emoji)

  // 添加自定义 emoji
  if (config.customEmojis) {
    Object.entries(config.customEmojis).forEach(([name, value]) => {
      md.renderer.rules.emoji = (tokens, idx) => {
        const token = tokens[idx]
        if (token.markup === name) {
          return value
        }
        return emoji.render(tokens, idx)
      }
    })
  }
}


