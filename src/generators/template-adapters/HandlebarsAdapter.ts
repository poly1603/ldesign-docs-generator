/**
 * Handlebars 模板适配器
 */

import Handlebars from 'handlebars'
import fs from 'fs-extra'
import * as path from 'path'
import type { ITemplateAdapter, TemplateAdapterOptions } from './ITemplateAdapter'

/**
 * Handlebars 适配器
 */
export class HandlebarsAdapter implements ITemplateAdapter {
  name = 'handlebars'
  private options: TemplateAdapterOptions = {}
  private handlebars: typeof Handlebars
  private cache = new Map<string, HandlebarsTemplateDelegate>()

  constructor() {
    this.handlebars = Handlebars.create()
  }

  /**
   * 初始化
   */
  async init(options: TemplateAdapterOptions): Promise<void> {
    this.options = {
      cache: true,
      ...options,
    }

    // 注册辅助函数
    if (options.helpers) {
      Object.entries(options.helpers).forEach(([name, fn]) => {
        this.registerHelper(name, fn)
      })
    }

    // 注册过滤器（Handlebars 通过 helper 实现）
    if (options.filters) {
      Object.entries(options.filters).forEach(([name, fn]) => {
        this.registerFilter(name, fn)
      })
    }

    // 加载片段
    if (options.partialsDir) {
      await this.loadPartials(options.partialsDir)
    }
  }

  /**
   * 渲染模板
   */
  async render(template: string, data: any): Promise<string> {
    const cacheKey = template

    // 检查缓存
    if (this.options.cache && this.cache.has(cacheKey)) {
      const compiled = this.cache.get(cacheKey)!
      return compiled(data)
    }

    // 编译模板
    const compiled = this.handlebars.compile(template)

    // 缓存编译结果
    if (this.options.cache) {
      this.cache.set(cacheKey, compiled)
    }

    return compiled(data)
  }

  /**
   * 渲染文件
   */
  async renderFile(filePath: string, data: any): Promise<string> {
    const cacheKey = `file:${filePath}`

    // 检查缓存
    if (this.options.cache && this.cache.has(cacheKey)) {
      const compiled = this.cache.get(cacheKey)!
      return compiled(data)
    }

    // 读取模板文件
    const template = await fs.readFile(filePath, 'utf-8')

    // 编译模板
    const compiled = this.handlebars.compile(template)

    // 缓存编译结果
    if (this.options.cache) {
      this.cache.set(cacheKey, compiled)
    }

    return compiled(data)
  }

  /**
   * 注册辅助函数
   */
  registerHelper(name: string, fn: Function): void {
    this.handlebars.registerHelper(name, fn as any)
  }

  /**
   * 注册过滤器（通过辅助函数实现）
   */
  registerFilter(name: string, fn: Function): void {
    this.handlebars.registerHelper(name, function (value: any, ...args: any[]) {
      return fn(value, ...args.slice(0, -1)) // 最后一个参数是 Handlebars options
    })
  }

  /**
   * 注册片段
   */
  registerPartial(name: string, content: string): void {
    this.handlebars.registerPartial(name, content)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 加载片段目录
   */
  private async loadPartials(partialsDir: string): Promise<void> {
    if (!(await fs.pathExists(partialsDir))) {
      return
    }

    const files = await fs.readdir(partialsDir)
    for (const file of files) {
      if (file.endsWith('.hbs') || file.endsWith('.handlebars')) {
        const filePath = path.join(partialsDir, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const name = path.basename(file, path.extname(file))
        this.registerPartial(name, content)
      }
    }
  }
}



