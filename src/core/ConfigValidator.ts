/**
 * 配置验证器
 */

import * as fs from 'fs-extra'
import type { DocsGeneratorOptions } from '../types'
import { ValidationError } from './errors'

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否验证通过 */
  valid: boolean
  /** 错误列表 */
  errors: string[]
  /** 警告列表 */
  warnings: string[]
}

/**
 * 配置验证器
 */
export class ConfigValidator {
  /**
   * 验证配置
   */
  validate(config: DocsGeneratorOptions): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证必填字段
    this.validateRequired(config, errors)

    // 验证目录
    this.validateDirectories(config, errors)

    // 验证插件
    this.validatePlugins(config, errors, warnings)

    // 验证站点配置
    this.validateSiteConfig(config, warnings)

    // 验证主题配置
    this.validateThemeConfig(config, warnings)

    // 验证导航配置
    this.validateNavigationConfig(config, warnings)

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 验证并抛出错误
   */
  validateOrThrow(config: DocsGeneratorOptions): void {
    const result = this.validate(config)

    if (!result.valid) {
      throw new ValidationError(
        '配置验证失败',
        result.errors
      )
    }

    // 输出警告
    if (result.warnings.length > 0) {
      console.warn('⚠️  配置警告:')
      result.warnings.forEach((warning) => {
        console.warn(`  - ${warning}`)
      })
      console.warn('')
    }
  }

  /**
   * 验证必填字段
   */
  private validateRequired(config: DocsGeneratorOptions, errors: string[]): void {
    if (!config.sourceDir) {
      errors.push('sourceDir 是必填项')
    }

    if (!config.outputDir) {
      errors.push('outputDir 是必填项')
    }
  }

  /**
   * 验证目录
   */
  private validateDirectories(config: DocsGeneratorOptions, errors: string[]): void {
    if (config.sourceDir && !fs.existsSync(config.sourceDir)) {
      errors.push(`sourceDir 不存在: ${config.sourceDir}`)
    }

    if (config.sourceDir && config.outputDir) {
      const sourcePath = fs.realpathSync(config.sourceDir)
      const outputPath = fs.existsSync(config.outputDir)
        ? fs.realpathSync(config.outputDir)
        : config.outputDir

      if (sourcePath === outputPath) {
        errors.push('sourceDir 和 outputDir 不能是同一个目录')
      }

      if (outputPath.startsWith(sourcePath)) {
        errors.push('outputDir 不能是 sourceDir 的子目录')
      }
    }
  }

  /**
   * 验证插件
   */
  private validatePlugins(
    config: DocsGeneratorOptions,
    errors: string[],
    warnings: string[]
  ): void {
    if (!config.plugins || config.plugins.length === 0) {
      warnings.push('未配置任何插件，可能无法生成文档')
      return
    }

    config.plugins.forEach((plugin, index) => {
      if (!plugin.name) {
        errors.push(`插件 #${index} 缺少 name 属性`)
      }

      if (!plugin.version) {
        warnings.push(`插件 ${plugin.name || `#${index}`} 缺少 version 属性`)
      }

      if (!plugin.parse && !plugin.transform && !plugin.generate) {
        warnings.push(
          `插件 ${plugin.name} 没有实现任何钩子 (parse/transform/generate)`
        )
      }
    })

    // 检查重复插件
    const pluginNames = config.plugins.map((p) => p.name).filter(Boolean)
    const duplicates = pluginNames.filter(
      (name, index) => pluginNames.indexOf(name) !== index
    )

    if (duplicates.length > 0) {
      warnings.push(`检测到重复的插件: ${duplicates.join(', ')}`)
    }
  }

  /**
   * 验证站点配置
   */
  private validateSiteConfig(
    config: DocsGeneratorOptions,
    warnings: string[]
  ): void {
    if (!config.site) {
      warnings.push('未配置 site，将使用默认配置')
      return
    }

    if (!config.site.title) {
      warnings.push('site.title 未配置，建议设置站点标题')
    }

    if (!config.site.description) {
      warnings.push('site.description 未配置，建议设置站点描述（有助于 SEO）')
    }

    // 验证 base 路径
    if (config.site.base && !config.site.base.startsWith('/')) {
      warnings.push('site.base 应该以 / 开头')
    }
  }

  /**
   * 验证主题配置
   */
  private validateThemeConfig(
    config: DocsGeneratorOptions,
    warnings: string[]
  ): void {
    if (!config.theme) {
      return
    }

    if (!config.theme.name) {
      warnings.push('theme.name 未配置，将使用默认主题')
    }

    if (config.theme.templateDir && !fs.existsSync(config.theme.templateDir)) {
      warnings.push(`theme.templateDir 不存在: ${config.theme.templateDir}`)
    }
  }

  /**
   * 验证导航配置
   */
  private validateNavigationConfig(
    config: DocsGeneratorOptions,
    warnings: string[]
  ): void {
    if (!config.navigation) {
      return
    }

    if (config.navigation.sidebar && config.navigation.sidebar !== 'auto') {
      if (Array.isArray(config.navigation.sidebar)) {
        if (config.navigation.sidebar.length === 0) {
          warnings.push('navigation.sidebar 配置为空数组，建议使用 "auto"')
        }
      }
    }

    if (config.navigation.topbar) {
      if (config.navigation.topbar.length === 0) {
        warnings.push('navigation.topbar 配置为空数组')
      }
    }
  }
}

/**
 * 创建验证器实例
 */
export function createValidator(): ConfigValidator {
  return new ConfigValidator()
}




