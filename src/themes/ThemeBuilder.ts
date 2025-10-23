/**
 * 主题构建器
 * 
 * 用于构建和打包主题
 */

import fs from 'fs-extra'
import * as path from 'path'
import type { Logger } from '../types'
import type { ThemePackageConfig } from './ThemeResolver'

/**
 * 主题构建器选项
 */
export interface ThemeBuilderOptions {
  /** 主题源目录 */
  sourceDir: string
  /** 输出目录 */
  outputDir: string
  /** 日志器 */
  logger: Logger
}

/**
 * 主题构建器
 */
export class ThemeBuilder {
  private options: ThemeBuilderOptions
  private logger: Logger

  constructor(options: ThemeBuilderOptions) {
    this.options = options
    this.logger = options.logger
  }

  /**
   * 构建主题
   */
  async build(): Promise<void> {
    this.logger.info('开始构建主题...')

    const { sourceDir, outputDir } = this.options

    // 确保目录存在
    await fs.ensureDir(outputDir)

    // 复制模板文件
    await this.copyTemplates(sourceDir, outputDir)

    // 复制资源文件
    await this.copyAssets(sourceDir, outputDir)

    // 生成主题配置
    await this.generateThemeConfig(sourceDir, outputDir)

    // 生成 package.json
    await this.generatePackageJson(sourceDir, outputDir)

    this.logger.success('主题构建完成！')
  }

  /**
   * 复制模板文件
   */
  private async copyTemplates(sourceDir: string, outputDir: string): Promise<void> {
    const templatesDir = path.join(sourceDir, 'templates')

    if (await fs.pathExists(templatesDir)) {
      const destDir = path.join(outputDir, 'templates')
      await fs.copy(templatesDir, destDir)
      this.logger.info('模板文件已复制')
    }
  }

  /**
   * 复制资源文件
   */
  private async copyAssets(sourceDir: string, outputDir: string): Promise<void> {
    const assetsDir = path.join(sourceDir, 'assets')

    if (await fs.pathExists(assetsDir)) {
      const destDir = path.join(outputDir, 'assets')
      await fs.copy(assetsDir, destDir)
      this.logger.info('资源文件已复制')
    }
  }

  /**
   * 生成主题配置
   */
  private async generateThemeConfig(sourceDir: string, outputDir: string): Promise<void> {
    const configPath = path.join(sourceDir, 'theme.config.js')

    if (await fs.pathExists(configPath)) {
      const destPath = path.join(outputDir, 'theme.config.js')
      await fs.copy(configPath, destPath)
    } else {
      // 生成默认配置
      const defaultConfig: ThemePackageConfig = {
        name: path.basename(sourceDir),
        version: '1.0.0',
        templates: {},
        styles: {},
        scripts: {},
      }

      const configContent = `module.exports = ${JSON.stringify(defaultConfig, null, 2)}`
      await fs.writeFile(
        path.join(outputDir, 'theme.config.js'),
        configContent,
        'utf-8'
      )
    }

    this.logger.info('主题配置已生成')
  }

  /**
   * 生成 package.json
   */
  private async generatePackageJson(sourceDir: string, outputDir: string): Promise<void> {
    const themeName = path.basename(sourceDir)

    const packageJson = {
      name: `@ldesign/docs-generator-theme-${themeName}`,
      version: '1.0.0',
      description: `${themeName} theme for @ldesign/docs-generator`,
      main: 'theme.config.js',
      files: [
        'templates',
        'assets',
        'theme.config.js',
      ],
      keywords: [
        'ldesign',
        'docs-generator',
        'theme',
        themeName,
      ],
      peerDependencies: {
        '@ldesign/docs-generator': '^2.0.0',
      },
    }

    await fs.writeJSON(
      path.join(outputDir, 'package.json'),
      packageJson,
      { spaces: 2 }
    )

    this.logger.info('package.json 已生成')
  }

  /**
   * 验证主题
   */
  async validate(themeDir: string): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查必需的文件
    const requiredFiles = ['templates', 'theme.config.js']

    for (const file of requiredFiles) {
      const filePath = path.join(themeDir, file)
      if (!(await fs.pathExists(filePath))) {
        errors.push(`缺少必需的文件或目录: ${file}`)
      }
    }

    // 检查模板文件
    const templatesDir = path.join(themeDir, 'templates')
    if (await fs.pathExists(templatesDir)) {
      const files = await fs.readdir(templatesDir)
      const hasLayout = files.some(f => f === 'layout.ejs' || f === 'layout.hbs')

      if (!hasLayout) {
        warnings.push('建议提供 layout 模板')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }
}



