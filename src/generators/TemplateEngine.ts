/**
 * 模板引擎
 */

import * as ejs from 'ejs'
import * as path from 'path'
import * as fs from 'fs-extra'
import type { TemplateData, Logger } from '../types'

/**
 * 模板引擎选项
 */
export interface TemplateEngineOptions {
  /** 模板目录 */
  templateDir: string
  /** 日志器 */
  logger: Logger
  /** 缓存模板 */
  cache?: boolean
}

/**
 * 模板引擎
 */
export class TemplateEngine {
  private options: TemplateEngineOptions
  private templateCache: Map<string, string> = new Map()

  constructor(options: TemplateEngineOptions) {
    this.options = {
      cache: true,
      ...options,
    }
  }

  /**
   * 渲染模板
   */
  async render(templatePath: string, data: TemplateData): Promise<string> {
    const { logger } = this.options

    try {
      // 加载模板
      const template = await this.loadTemplate(templatePath)

      // 渲染模板
      const html = ejs.render(template, data, {
        filename: templatePath,
        cache: this.options.cache,
      })

      return html
    } catch (error) {
      logger.error(`模板渲染失败: ${templatePath}`, error)
      throw error
    }
  }

  /**
   * 渲染文件
   */
  async renderFile(
    templatePath: string,
    data: TemplateData,
    outputPath: string
  ): Promise<void> {
    const html = await this.render(templatePath, data)
    await fs.ensureDir(path.dirname(outputPath))
    await fs.writeFile(outputPath, html, 'utf-8')
  }

  /**
   * 加载模板
   */
  private async loadTemplate(templatePath: string): Promise<string> {
    // 检查缓存
    if (this.options.cache && this.templateCache.has(templatePath)) {
      return this.templateCache.get(templatePath)!
    }

    // 构建完整路径
    const fullPath = path.isAbsolute(templatePath)
      ? templatePath
      : path.join(this.options.templateDir, templatePath)

    // 读取模板文件
    const template = await fs.readFile(fullPath, 'utf-8')

    // 缓存模板
    if (this.options.cache) {
      this.templateCache.set(templatePath, template)
    }

    return template
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.templateCache.clear()
  }

  /**
   * 注册辅助函数
   */
  registerHelper(name: string, fn: Function): void {
    // EJS 通过 data 传递辅助函数
    // 这里可以扩展为支持多个模板引擎
  }
}




