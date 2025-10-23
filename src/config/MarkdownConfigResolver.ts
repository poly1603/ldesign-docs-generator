/**
 * Markdown 配置解析器
 * 解析和验证 Markdown 配置
 */

import type { MarkdownConfig } from '../types'
import type { Logger } from '../types'

/**
 * Markdown 配置解析器
 */
export class MarkdownConfigResolver {
  private logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

  /**
   * 解析配置
   */
  resolve(config: Partial<MarkdownConfig> = {}): Required<MarkdownConfig> {
    const resolved: Required<MarkdownConfig> = {
      lineNumbers: config.lineNumbers !== false,
      containers: config.containers !== false,
      emoji: config.emoji !== false,
      anchor: config.anchor !== false,
      theme: config.theme || 'dark-plus',
      markdownItOptions: config.markdownItOptions || {},
      markdownItPlugins: config.markdownItPlugins || [],
    }

    this.logger.debug('Markdown 配置已解析')

    return resolved
  }

  /**
   * 验证配置
   */
  validate(config: MarkdownConfig): boolean {
    // 验证主题
    const validThemes = ['dark-plus', 'light-plus', 'monokai', 'nord', 'one-dark-pro']
    if (config.theme && !validThemes.includes(config.theme)) {
      this.logger.warn(`无效的代码主题: ${config.theme}，使用默认主题 dark-plus`)
    }

    // 验证插件
    if (config.markdownItPlugins) {
      if (!Array.isArray(config.markdownItPlugins)) {
        this.logger.error('markdownItPlugins 必须是数组')
        return false
      }
    }

    return true
  }

  /**
   * 获取默认配置
   */
  getDefaults(): Required<MarkdownConfig> {
    return {
      lineNumbers: true,
      containers: true,
      emoji: true,
      anchor: true,
      theme: 'dark-plus',
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true,
      },
      markdownItPlugins: [],
    }
  }

  /**
   * 合并配置
   */
  merge(...configs: Partial<MarkdownConfig>[]): Required<MarkdownConfig> {
    const defaults = this.getDefaults()

    return configs.reduce((merged, config) => {
      return {
        ...merged,
        ...config,
        markdownItOptions: {
          ...merged.markdownItOptions,
          ...config.markdownItOptions,
        },
        markdownItPlugins: [
          ...merged.markdownItPlugins,
          ...(config.markdownItPlugins || []),
        ],
      }
    }, defaults)
  }
}

/**
 * 创建 Markdown 配置解析器
 */
export function createMarkdownConfigResolver(logger: Logger): MarkdownConfigResolver {
  return new MarkdownConfigResolver(logger)
}


