/**
 * 国际化管理器
 * 管理多语言翻译和语言切换
 */

import * as fs from 'fs-extra'
import * as path from 'path'
import type { Logger } from '../types'

/**
 * 语言配置
 */
export interface LocaleConfig {
  /** 语言代码 */
  lang: string
  /** 语言标签（用于 HTML lang 属性）*/
  label: string
  /** 语言选择器中显示的名称 */
  selectText?: string
  /** 翻译文本 */
  translations: Record<string, string>
}

/**
 * i18n 配置
 */
export interface I18nConfig {
  /** 默认语言 */
  defaultLocale: string
  /** 所有语言配置 */
  locales: Record<string, LocaleConfig>
  /** 回退语言 */
  fallbackLocale?: string
}

/**
 * 国际化管理器
 */
export class I18nManager {
  private config: I18nConfig
  private logger: Logger
  private currentLocale: string

  constructor(config: I18nConfig, logger: Logger) {
    this.config = config
    this.logger = logger
    this.currentLocale = config.defaultLocale
  }

  /**
   * 获取当前语言
   */
  getCurrentLocale(): string {
    return this.currentLocale
  }

  /**
   * 设置当前语言
   */
  setCurrentLocale(locale: string): void {
    if (!this.config.locales[locale]) {
      this.logger.warn(`语言 "${locale}" 不存在，使用默认语言`)
      this.currentLocale = this.config.defaultLocale
      return
    }

    this.currentLocale = locale
    this.logger.debug(`切换语言到: ${locale}`)
  }

  /**
   * 翻译文本
   */
  t(key: string, locale?: string): string {
    const lang = locale || this.currentLocale
    const localeConfig = this.config.locales[lang]

    if (!localeConfig) {
      this.logger.warn(`语言 "${lang}" 不存在`)
      return key
    }

    // 查找翻译
    let translation = localeConfig.translations[key]

    // 如果未找到，尝试回退语言
    if (!translation && this.config.fallbackLocale) {
      const fallbackConfig = this.config.locales[this.config.fallbackLocale]
      if (fallbackConfig) {
        translation = fallbackConfig.translations[key]
      }
    }

    // 如果仍未找到，返回 key
    if (!translation) {
      this.logger.warn(`未找到翻译: ${key} (语言: ${lang})`)
      return key
    }

    return translation
  }

  /**
   * 获取所有可用语言
   */
  getAvailableLocales(): Array<{ lang: string; label: string; selectText?: string }> {
    return Object.values(this.config.locales).map((locale) => ({
      lang: locale.lang,
      label: locale.label,
      selectText: locale.selectText,
    }))
  }

  /**
   * 获取语言配置
   */
  getLocaleConfig(locale: string): LocaleConfig | undefined {
    return this.config.locales[locale]
  }

  /**
   * 加载语言文件
   */
  async loadLocaleFile(localePath: string): Promise<void> {
    try {
      const content = await fs.readFile(localePath, 'utf-8')
      const translations = JSON.parse(content)

      const locale = path.basename(localePath, '.json')
      
      if (!this.config.locales[locale]) {
        this.config.locales[locale] = {
          lang: locale,
          label: locale,
          translations: {},
        }
      }

      this.config.locales[locale].translations = {
        ...this.config.locales[locale].translations,
        ...translations,
      }

      this.logger.debug(`已加载语言文件: ${localePath}`)
    } catch (error) {
      this.logger.error(`加载语言文件失败: ${localePath}`, error)
    }
  }

  /**
   * 加载目录中的所有语言文件
   */
  async loadLocalesDir(localesDir: string): Promise<void> {
    try {
      const files = await fs.readdir(localesDir)
      const jsonFiles = files.filter((file) => file.endsWith('.json'))

      for (const file of jsonFiles) {
        await this.loadLocaleFile(path.join(localesDir, file))
      }

      this.logger.info(`已加载 ${jsonFiles.length} 个语言文件`)
    } catch (error) {
      this.logger.error(`加载语言目录失败: ${localesDir}`, error)
    }
  }
}

/**
 * 创建 i18n 管理器
 */
export function createI18nManager(config: I18nConfig, logger: Logger): I18nManager {
  return new I18nManager(config, logger)
}


