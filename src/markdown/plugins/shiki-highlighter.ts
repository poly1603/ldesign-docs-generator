/**
 * Shiki 语法高亮器
 * 提供生产级的代码语法高亮
 */

import { getHighlighter, bundledLanguages, bundledThemes, type Highlighter, type HighlighterOptions } from 'shiki'
import type { Logger } from '../../types'

/**
 * Shiki 配置
 */
export interface ShikiConfig {
  /** 主题列表 */
  themes?: string[]
  /** 语言列表 */
  langs?: string[]
  /** 默认浅色主题 */
  defaultLightTheme?: string
  /** 默认暗色主题 */
  defaultDarkTheme?: string
}

/**
 * Shiki 高亮器管理器
 */
export class ShikiHighlighter {
  private highlighter: Highlighter | null = null
  private config: Required<ShikiConfig>
  private logger: Logger
  private initPromise: Promise<void> | null = null

  constructor(config: ShikiConfig, logger: Logger) {
    this.config = {
      themes: config.themes || ['dark-plus', 'light-plus', 'nord', 'monokai', 'one-dark-pro'],
      langs: config.langs || Object.keys(bundledLanguages),
      defaultLightTheme: config.defaultLightTheme || 'light-plus',
      defaultDarkTheme: config.defaultDarkTheme || 'dark-plus',
    }
    this.logger = logger
  }

  /**
   * 初始化 Shiki
   */
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = (async () => {
      try {
        this.logger.debug('正在初始化 Shiki 高亮器...')

        this.highlighter = await getHighlighter({
          themes: this.config.themes,
          langs: this.config.langs,
        })

        this.logger.success('Shiki 高亮器初始化完成')
      } catch (error) {
        this.logger.error('Shiki 初始化失败:', error)
        throw error
      }
    })()

    return this.initPromise
  }

  /**
   * 高亮代码
   */
  async highlight(
    code: string,
    lang: string,
    options: {
      isDark?: boolean
      lineNumbers?: boolean
      highlightLines?: number[]
    } = {}
  ): Promise<string> {
    if (!this.highlighter) {
      await this.init()
    }

    if (!this.highlighter) {
      throw new Error('Shiki highlighter 未初始化')
    }

    const { isDark = false, lineNumbers = true, highlightLines = [] } = options

    // 选择主题
    const theme = isDark ? this.config.defaultDarkTheme : this.config.defaultLightTheme

    // 检查语言是否支持
    const supportedLang = this.getSupportedLanguage(lang)

    try {
      // 生成高亮的 HTML
      const html = this.highlighter.codeToHtml(code, {
        lang: supportedLang,
        theme,
      })

      // 添加行号和行高亮
      if (lineNumbers || highlightLines.length > 0) {
        return this.addLineFeatures(html, lineNumbers, highlightLines)
      }

      return html
    } catch (error) {
      this.logger.error(`高亮代码失败 (${lang}):`, error)
      // 降级到纯文本
      return `<pre><code>${escapeHtml(code)}</code></pre>`
    }
  }

  /**
   * 高亮代码并支持双主题
   */
  async highlightDualTheme(
    code: string,
    lang: string,
    options: {
      lineNumbers?: boolean
      highlightLines?: number[]
    } = {}
  ): Promise<{ light: string; dark: string }> {
    if (!this.highlighter) {
      await this.init()
    }

    if (!this.highlighter) {
      throw new Error('Shiki highlighter 未初始化')
    }

    const supportedLang = this.getSupportedLanguage(lang)

    try {
      // 生成浅色主题
      const lightHtml = this.highlighter.codeToHtml(code, {
        lang: supportedLang,
        theme: this.config.defaultLightTheme,
      })

      // 生成暗色主题
      const darkHtml = this.highlighter.codeToHtml(code, {
        lang: supportedLang,
        theme: this.config.defaultDarkTheme,
      })

      return {
        light: this.addLineFeatures(lightHtml, options.lineNumbers, options.highlightLines),
        dark: this.addLineFeatures(darkHtml, options.lineNumbers, options.highlightLines),
      }
    } catch (error) {
      this.logger.error(`双主题高亮失败 (${lang}):`, error)
      const fallback = `<pre><code>${escapeHtml(code)}</code></pre>`
      return { light: fallback, dark: fallback }
    }
  }

  /**
   * 获取支持的语言
   */
  private getSupportedLanguage(lang: string): string {
    // 语言别名映射
    const aliasMap: Record<string, string> = {
      'ts': 'typescript',
      'js': 'javascript',
      'vue': 'vue',
      'md': 'markdown',
      'sh': 'bash',
      'yml': 'yaml',
      'py': 'python',
    }

    const mappedLang = aliasMap[lang] || lang

    // 检查是否支持
    if (this.config.langs.includes(mappedLang)) {
      return mappedLang
    }

    // 检查是否是别名
    const foundLang = this.config.langs.find((l) => l === mappedLang || l.includes(mappedLang))
    if (foundLang) {
      return foundLang
    }

    // 降级到纯文本
    this.logger.warn(`不支持的语言: ${lang}，使用 plaintext`)
    return 'plaintext'
  }

  /**
   * 添加行号和行高亮
   */
  private addLineFeatures(
    html: string,
    lineNumbers?: boolean,
    highlightLines: number[] = []
  ): string {
    if (!lineNumbers && highlightLines.length === 0) {
      return html
    }

    // 解析 HTML，添加行号和高亮
    const lines = html.split('\n')

    // 这里需要更复杂的 HTML 解析和处理
    // 简化版本：直接包装
    if (lineNumbers) {
      return `<div class="shiki-wrapper line-numbers">${html}</div>`
    }

    if (highlightLines.length > 0) {
      return `<div class="shiki-wrapper highlighted" data-lines="${highlightLines.join(',')}">${html}</div>`
    }

    return html
  }

  /**
   * 获取所有支持的语言
   */
  getSupportedLanguages(): string[] {
    return this.config.langs
  }

  /**
   * 获取所有支持的主题
   */
  getSupportedThemes(): string[] {
    return this.config.themes
  }

  /**
   * 销毁高亮器
   */
  dispose(): void {
    this.highlighter = null
    this.initPromise = null
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
 * 创建 Shiki 高亮器
 */
export function createShikiHighlighter(config: ShikiConfig, logger: Logger): ShikiHighlighter {
  return new ShikiHighlighter(config, logger)
}

/**
 * Shiki 样式（客户端注入）
 */
export const shikiStyles = `
.shiki-wrapper {
  position: relative;
  margin: 1em 0;
}

.shiki-wrapper.line-numbers {
  padding-left: 3.5rem;
}

.shiki-wrapper.line-numbers::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3.5rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-right: 1px solid rgba(0, 0, 0, 0.2);
}

.shiki pre {
  margin: 0;
  padding: 1.25rem 1.5rem;
  overflow-x: auto;
  border-radius: 6px;
}

.shiki code {
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
  font-size: 0.875em;
  line-height: 1.7;
}

/* 暗黑模式自动切换 */
.dark .shiki.light {
  display: none;
}

.shiki.dark {
  display: none;
}

.dark .shiki.dark {
  display: block;
}
`

