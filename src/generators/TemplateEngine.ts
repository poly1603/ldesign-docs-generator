/**
 * 模板引擎
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import type { TemplateData, Logger } from '../types'
import type { ITemplateAdapter } from './template-adapters/ITemplateAdapter'
import { EjsAdapter } from './template-adapters/EjsAdapter'

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
  /** 模板引擎类型 */
  engine?: 'ejs' | 'handlebars' | 'nunjucks' | ITemplateAdapter
  /** 片段目录 */
  partialsDir?: string
  /** 自定义辅助函数 */
  helpers?: Record<string, Function>
  /** 自定义过滤器 */
  filters?: Record<string, Function>
}

/**
 * 模板引擎
 */
export class TemplateEngine {
  private options: TemplateEngineOptions
  private adapter: ITemplateAdapter
  private logger: Logger

  constructor(options: TemplateEngineOptions) {
    this.options = {
      cache: true,
      engine: 'ejs',
      ...options,
    }
    this.logger = options.logger

    // 默认使用 EJS
    this.adapter = new EjsAdapter()
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    // 创建适配器
    this.adapter = await this.createAdapter()

    await this.adapter.init({
      templateDir: this.options.templateDir,
      partialsDir: this.options.partialsDir,
      helpers: this.options.helpers,
      filters: this.options.filters,
      cache: this.options.cache,
    })

    this.logger.debug(`模板引擎已初始化: ${this.adapter.name}`)
  }

  /**
   * 创建适配器
   */
  private async createAdapter(): Promise<ITemplateAdapter> {
    const { engine } = this.options

    // 如果已经是适配器实例，直接使用
    if (typeof engine === 'object' && 'render' in engine) {
      return engine
    }

    // 根据类型创建适配器
    switch (engine) {
      case 'ejs':
        return new EjsAdapter()
      case 'handlebars': {
        // 延迟加载（可选依赖）
        try {
          const module = await import('./template-adapters/HandlebarsAdapter.js')
          return new module.HandlebarsAdapter()
        } catch (error) {
          this.logger.warn('Handlebars 未安装，使用默认 EJS')
          return new EjsAdapter()
        }
      }
      case 'nunjucks': {
        // 延迟加载（可选依赖）
        try {
          const module = await import('./template-adapters/NunjucksAdapter.js')
          return new module.NunjucksAdapter()
        } catch (error) {
          this.logger.warn('Nunjucks 未安装，使用默认 EJS')
          return new EjsAdapter()
        }
      }
      default:
        this.logger.warn(`未知的模板引擎: ${engine}，使用默认 EJS`)
        return new EjsAdapter()
    }
  }

  /**
   * 渲染模板字符串
   */
  async render(template: string, data: TemplateData): Promise<string> {
    try {
      return await this.adapter.render(template, data)
    } catch (error) {
      this.logger.error('模板渲染失败:', error)
      throw error
    }
  }

  /**
   * 渲染模板文件
   */
  async renderFile(
    templatePath: string,
    data: TemplateData,
    outputPath?: string
  ): Promise<string> {
    try {
      // 构建完整路径
      const fullPath = path.isAbsolute(templatePath)
        ? templatePath
        : path.join(this.options.templateDir, templatePath)

      // 渲染模板
      const html = await this.adapter.renderFile(fullPath, data)

      // 如果指定了输出路径，写入文件
      if (outputPath) {
        await fs.ensureDir(path.dirname(outputPath))
        await fs.writeFile(outputPath, html, 'utf-8')
      }

      return html
    } catch (error) {
      this.logger.error(`渲染模板文件失败: ${templatePath}`, error)
      throw error
    }
  }

  /**
   * 注册辅助函数
   */
  registerHelper(name: string, fn: Function): void {
    this.adapter.registerHelper(name, fn)
  }

  /**
   * 注册过滤器
   */
  registerFilter(name: string, fn: Function): void {
    this.adapter.registerFilter(name, fn)
  }

  /**
   * 注册片段
   */
  registerPartial(name: string, content: string): void {
    this.adapter.registerPartial(name, content)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.adapter.clearCache()
  }

  /**
   * 获取适配器名称
   */
  getAdapterName(): string {
    return this.adapter.name
  }
}




