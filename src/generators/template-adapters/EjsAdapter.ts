/**
 * EJS 模板适配器
 */

import * as ejs from 'ejs'
import fs from 'fs-extra'
import * as path from 'path'
import type { ITemplateAdapter, TemplateAdapterOptions } from './ITemplateAdapter'

/**
 * EJS 适配器
 */
export class EjsAdapter implements ITemplateAdapter {
  name = 'ejs'
  private options: TemplateAdapterOptions = {}
  private helpers: Record<string, Function> = {}
  private partials: Record<string, string> = {}
  private cache = new Map<string, ejs.TemplateFunction>()

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
      return compiled(this.prepareData(data))
    }

    // 编译模板
    const compiled = ejs.compile(template, {
      cache: false,
      filename: 'inline-template',
    })

    // 缓存编译结果
    if (this.options.cache) {
      this.cache.set(cacheKey, compiled)
    }

    return compiled(this.prepareData(data))
  }

  /**
   * 渲染文件
   */
  async renderFile(filePath: string, data: any): Promise<string> {
    const cacheKey = `file:${filePath}`

    // 检查缓存
    if (this.options.cache && this.cache.has(cacheKey)) {
      const compiled = this.cache.get(cacheKey)!
      return compiled(this.prepareData(data))
    }

    // 读取模板文件
    const template = await fs.readFile(filePath, 'utf-8')

    // 编译模板
    const compiled = ejs.compile(template, {
      cache: false,
      filename: filePath,
      root: this.options.templateDir || path.dirname(filePath),
    })

    // 缓存编译结果
    if (this.options.cache) {
      this.cache.set(cacheKey, compiled)
    }

    return compiled(this.prepareData(data))
  }

  /**
   * 注册辅助函数
   */
  registerHelper(name: string, fn: Function): void {
    this.helpers[name] = fn
  }

  /**
   * 注册过滤器（EJS 没有过滤器概念，通过辅助函数实现）
   */
  registerFilter(name: string, fn: Function): void {
    this.registerHelper(name, fn)
  }

  /**
   * 注册片段
   */
  registerPartial(name: string, content: string): void {
    this.partials[name] = content
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 准备数据
   */
  private prepareData(data: any): any {
    return {
      ...data,
      ...this.helpers,
      include: (partialName: string, partialData?: any) => {
        return this.includePartial(partialName, partialData || data)
      },
    }
  }

  /**
   * 包含片段
   */
  private includePartial(name: string, data: any): string {
    const partial = this.partials[name]
    if (!partial) {
      throw new Error(`片段 ${name} 不存在`)
    }

    try {
      const compiled = ejs.compile(partial, {
        cache: false,
        filename: `partial:${name}`,
      })
      return compiled(this.prepareData(data))
    } catch (error) {
      throw new Error(`渲染片段 ${name} 失败: ${error}`)
    }
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
      if (file.endsWith('.ejs')) {
        const filePath = path.join(partialsDir, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const name = path.basename(file, '.ejs')
        this.registerPartial(name, content)
      }
    }
  }
}



