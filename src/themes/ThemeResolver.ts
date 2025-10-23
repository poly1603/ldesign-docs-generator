/**
 * 主题解析器
 * 
 * 负责加载、解析和管理主题
 */

import fs from 'fs-extra'
import * as path from 'path'
import type { Logger, ThemeConfig, Theme } from '../types'

/**
 * 主题包配置
 */
export interface ThemePackageConfig {
  name: string
  version: string
  author?: string
  description?: string
  extends?: string  // 继承的主题
  templates?: Record<string, string>
  styles?: Record<string, any>
  scripts?: Record<string, string>
  assets?: string[]
}

/**
 * 主题解析器
 */
export class ThemeResolver {
  private logger: Logger
  private themesCache = new Map<string, Theme>()

  constructor(logger: Logger) {
    this.logger = logger
  }

  /**
   * 解析主题
   * 
   * @param config - 主题配置
   * @param baseDir - 基础目录
   * @returns 解析后的主题对象
   */
  async resolve(config: ThemeConfig, baseDir: string): Promise<Theme> {
    const { name } = config

    // 检查缓存
    const cacheKey = `${name}-${baseDir}`
    if (this.themesCache.has(cacheKey)) {
      return this.themesCache.get(cacheKey)!
    }

    this.logger.debug(`解析主题: ${name}`)

    // 内置主题
    if (this.isBuiltinTheme(name)) {
      return this.loadBuiltinTheme(name)
    }

    // 本地主题
    if (config.templateDir) {
      return this.loadLocalTheme(config)
    }

    // NPM 包主题
    if (this.isNpmTheme(name)) {
      return this.loadNpmTheme(name, baseDir)
    }

    // 默认主题
    this.logger.warn(`主题 ${name} 未找到，使用默认主题`)
    return this.loadBuiltinTheme('default')
  }

  /**
   * 是否为内置主题
   */
  private isBuiltinTheme(name: string): boolean {
    const builtinThemes = ['default', 'modern', 'minimal', 'docs', 'api', 'component']
    return builtinThemes.includes(name)
  }

  /**
   * 是否为 NPM 主题
   */
  private isNpmTheme(name: string): boolean {
    return name.startsWith('@') || name.includes('/')
  }

  /**
   * 加载内置主题
   */
  private async loadBuiltinTheme(name: string): Promise<Theme> {
    const themePath = path.join(__dirname, '../../templates', name)

    return this.loadThemeFromPath(name, themePath)
  }

  /**
   * 加载本地主题
   */
  private async loadLocalTheme(config: ThemeConfig): Promise<Theme> {
    const { name, templateDir, styles, scripts } = config

    if (!templateDir) {
      throw new Error('本地主题必须指定 templateDir')
    }

    const theme = await this.loadThemeFromPath(name, templateDir)

    // 合并自定义样式
    if (styles) {
      theme.styles = { ...theme.styles, ...styles }
    }

    // 合并自定义脚本
    if (scripts && Array.isArray(scripts)) {
      // scripts 是字符串数组，转换为对象
      scripts.forEach((script, index) => {
        theme.scripts[`custom-${index}`] = script
      })
    } else if (scripts) {
      theme.scripts = { ...theme.scripts, ...(scripts as Record<string, string>) }
    }

    return theme
  }

  /**
   * 加载 NPM 主题
   */
  private async loadNpmTheme(name: string, baseDir: string): Promise<Theme> {
    try {
      // 尝试动态导入 NPM 包
      const themeModule = await import(name)
      const themeConfig: ThemePackageConfig = themeModule.default || themeModule

      // 如果主题继承自其他主题
      if (themeConfig.extends) {
        const baseTheme = await this.resolve(
          { name: themeConfig.extends },
          baseDir
        )

        // 合并主题
        return this.mergeThemes(baseTheme, themeConfig)
      }

      // 构建主题对象
      return {
        name: themeConfig.name,
        templates: themeConfig.templates || {},
        styles: themeConfig.styles || {},
        scripts: themeConfig.scripts || {},
        assets: themeConfig.assets || [],
      }
    } catch (error) {
      this.logger.error(`加载 NPM 主题失败: ${name}`, error)
      throw error
    }
  }

  /**
   * 从路径加载主题
   */
  private async loadThemeFromPath(name: string, themePath: string): Promise<Theme> {
    if (!(await fs.pathExists(themePath))) {
      throw new Error(`主题目录不存在: ${themePath}`)
    }

    // 查找模板文件
    const templates: Record<string, string> = {}
    const templateFiles = await fs.readdir(themePath)

    for (const file of templateFiles) {
      if (file.endsWith('.ejs') || file.endsWith('.hbs') || file.endsWith('.njk')) {
        const filePath = path.join(themePath, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const templateName = path.basename(file, path.extname(file))
        templates[templateName] = content
      }
    }

    // 查找主题配置文件
    const configPath = path.join(themePath, 'theme.config.js')
    let themeConfig: Partial<ThemePackageConfig> = {}

    if (await fs.pathExists(configPath)) {
      try {
        const configModule = await import(configPath)
        themeConfig = configModule.default || configModule
      } catch (error) {
        this.logger.warn(`加载主题配置失败: ${configPath}`, error)
      }
    }

    return {
      name,
      templates,
      styles: themeConfig.styles || {},
      scripts: themeConfig.scripts || {},
      assets: themeConfig.assets,
    }
  }

  /**
   * 合并主题
   */
  private mergeThemes(baseTheme: Theme, extension: ThemePackageConfig): Theme {
    return {
      name: extension.name,
      templates: {
        ...baseTheme.templates,
        ...extension.templates,
      },
      styles: {
        ...baseTheme.styles,
        ...extension.styles,
      },
      scripts: {
        ...baseTheme.scripts,
        ...extension.scripts,
      },
      assets: [
        ...(baseTheme.assets || []),
        ...(extension.assets || []),
      ],
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.themesCache.clear()
  }
}


