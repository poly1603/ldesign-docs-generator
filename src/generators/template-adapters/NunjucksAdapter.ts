/**
 * Nunjucks 模板适配器
 */

// @ts-ignore - nunjucks 没有类型定义
import * as nunjucks from 'nunjucks'
import fs from 'fs-extra'
import * as path from 'path'
import type { ITemplateAdapter, TemplateAdapterOptions } from './ITemplateAdapter'

/**
 * Nunjucks 适配器
 */
export class NunjucksAdapter implements ITemplateAdapter {
  name = 'nunjucks'
  private options: TemplateAdapterOptions = {}
  private env: nunjucks.Environment
  private cache = new Map<string, nunjucks.Template>()

  constructor() {
    this.env = new nunjucks.Environment(undefined, {
      autoescape: true,
      trimBlocks: true,
      lstripBlocks: true,
    })
  }

  /**
   * 初始化
   */
  async init(options: TemplateAdapterOptions): Promise<void> {
    this.options = {
      cache: true,
      ...options,
    }

    // 设置模板目录
    if (options.templateDir) {
      this.env = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(options.templateDir, {
          noCache: !options.cache,
        }),
        {
          autoescape: true,
          trimBlocks: true,
          lstripBlocks: true,
        }
      )
    }

    // 注册辅助函数（Nunjucks 叫 global）
    if (options.helpers) {
      Object.entries(options.helpers).forEach(([name, fn]) => {
        this.registerHelper(name, fn)
      })
    }

    // 注册过滤器
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
    return new Promise((resolve, reject) => {
      try {
        const cacheKey = template

        // 检查缓存
        if (this.options.cache && this.cache.has(cacheKey)) {
          const compiled = this.cache.get(cacheKey)!
          const result = compiled.render(data)
          resolve(result)
          return
        }

        // 编译模板
        const compiled = nunjucks.compile(template, this.env)

        // 缓存编译结果
        if (this.options.cache) {
          this.cache.set(cacheKey, compiled)
        }

        const result = compiled.render(data)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 渲染文件
   */
  async renderFile(filePath: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.env.render(filePath, data, (err: any, result: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(result || '')
        }
      })
    })
  }

  /**
   * 注册辅助函数
   */
  registerHelper(name: string, fn: Function): void {
    this.env.addGlobal(name, fn)
  }

  /**
   * 注册过滤器
   */
  registerFilter(name: string, fn: Function): void {
    this.env.addFilter(name, fn as any)
  }

  /**
   * 注册片段（Nunjucks 使用 extends/include）
   */
  registerPartial(name: string, content: string): void {
    // Nunjucks 的片段通过文件系统加载
    // 这里我们可以添加到字符串加载器
    this.env.renderString(content) // 预编译验证
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

    // Nunjucks 会自动从配置的目录加载片段
    // 如果需要预加载，可以在这里实现
  }
}



