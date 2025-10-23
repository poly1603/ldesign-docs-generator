/**
 * 主题管理器
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import { readFileSync } from 'fs'
import type { Theme, ThemeConfig, Logger } from '../types'

/**
 * 主题管理器选项
 */
export interface ThemeManagerOptions {
  /** 主题配置 */
  themeConfig: ThemeConfig
  /** 内置主题目录 */
  builtinThemesDir: string
  /** 日志器 */
  logger: Logger
}

/**
 * 主题管理器
 */
export class ThemeManager {
  private options: ThemeManagerOptions
  private themes: Map<string, Theme> = new Map()
  public currentTheme!: Theme

  constructor(options: ThemeManagerOptions) {
    this.options = options
    this.loadTheme(options.themeConfig.name)
  }

  /**
   * 加载主题
   */
  private loadTheme(themeName: string): void {
    const { logger, builtinThemesDir } = this.options

    try {
      // 检查是否已加载
      if (this.themes.has(themeName)) {
        this.currentTheme = this.themes.get(themeName)!
        return
      }

      // 加载主题
      let theme: Theme

      if (themeName === 'default') {
        // 加载默认主题
        theme = this.createDefaultTheme()
      } else {
        // 从文件系统加载
        const themePath = path.join(builtinThemesDir, themeName)
        theme = this.loadThemeFromDir(themePath)
      }

      // 缓存主题
      this.themes.set(themeName, theme)
      this.currentTheme = theme

      logger.debug(`主题加载成功: ${themeName}`)
    } catch (error) {
      logger.error(`主题加载失败: ${themeName}`, error)
      // 回退到默认主题
      this.currentTheme = this.createDefaultTheme()
    }
  }

  /**
   * 从目录加载主题
   */
  private loadThemeFromDir(themePath: string): Theme {
    // 使用 fs 同步读取（配置文件通常很小）
    const themeConfigPath = path.join(themePath, 'theme.json')
    const themeConfig = JSON.parse(readFileSync(themeConfigPath, 'utf-8'))

    return {
      name: themeConfig.name,
      templates: themeConfig.templates || {},
      styles: themeConfig.styles || {},
      scripts: themeConfig.scripts || {},
      assets: themeConfig.assets || [],
    }
  }

  /**
   * 创建默认主题
   */
  private createDefaultTheme(): Theme {
    return {
      name: 'default',
      templates: {
        layout: 'layout.ejs',
        api: 'api.ejs',
        component: 'component.ejs',
        markdown: 'markdown.ejs',
        index: 'index.ejs',
      },
      styles: {
        primaryColor: '#3498db',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        sidebarWidth: '280px',
        contentMaxWidth: '1200px',
        fontSize: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      scripts: {},
      assets: [],
    }
  }

  /**
   * 注册主题
   */
  registerTheme(theme: Theme): void {
    this.themes.set(theme.name, theme)
    this.options.logger.debug(`主题已注册: ${theme.name}`)
  }

  /**
   * 切换主题
   */
  switchTheme(themeName: string): void {
    this.loadTheme(themeName)
  }

  /**
   * 获取模板路径
   */
  getTemplate(type: string): string {
    return this.currentTheme.templates[type] || this.currentTheme.templates.default || 'layout.ejs'
  }

  /**
   * 获取样式变量
   */
  getStyles(): Record<string, any> {
    return this.currentTheme.styles
  }

  /**
   * 获取脚本
   */
  getScripts(): Record<string, string> {
    return this.currentTheme.scripts
  }

  /**
   * 生成 CSS 变量
   */
  generateCSSVariables(): string {
    const styles = this.getStyles()
    const cssVars = Object.entries(styles)
      .map(([key, value]) => {
        // 将 camelCase 转换为 kebab-case
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        return `  --${cssKey}: ${value};`
      })
      .join('\n')

    return `:root {\n${cssVars}\n}`
  }

  /**
   * 复制主题资源
   */
  async copyAssets(outputDir: string): Promise<void> {
    const { logger } = this.options
    const assetsDir = path.join(outputDir, 'assets')

    await fs.ensureDir(assetsDir)

    // 复制主题资源
    for (const asset of this.currentTheme.assets || []) {
      try {
        const sourcePath = path.join(this.options.builtinThemesDir, this.currentTheme.name, asset)
        const targetPath = path.join(assetsDir, asset)

        await fs.copy(sourcePath, targetPath)
        logger.debug(`资源已复制: ${asset}`)
      } catch (error) {
        logger.warn(`资源复制失败: ${asset}`, error)
      }
    }

    // 生成样式文件
    const cssVariables = this.generateCSSVariables()
    await fs.writeFile(path.join(assetsDir, 'theme-variables.css'), cssVariables, 'utf-8')
  }
}


