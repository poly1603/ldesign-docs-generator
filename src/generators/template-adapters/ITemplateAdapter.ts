/**
 * 模板适配器接口
 * 
 * 用于支持多种模板引擎
 */

/**
 * 模板适配器选项
 */
export interface TemplateAdapterOptions {
  /** 模板目录 */
  templateDir?: string
  /** 自定义辅助函数 */
  helpers?: Record<string, Function>
  /** 自定义过滤器 */
  filters?: Record<string, Function>
  /** 片段（partials）目录 */
  partialsDir?: string
  /** 是否缓存模板 */
  cache?: boolean
}

/**
 * 模板适配器接口
 */
export interface ITemplateAdapter {
  /** 适配器名称 */
  name: string

  /**
   * 初始化
   */
  init(options: TemplateAdapterOptions): Promise<void>

  /**
   * 渲染模板
   * 
   * @param template 模板字符串或模板路径
   * @param data 模板数据
   * @returns 渲染结果
   */
  render(template: string, data: any): Promise<string>

  /**
   * 渲染文件
   * 
   * @param filePath 模板文件路径
   * @param data 模板数据
   * @returns 渲染结果
   */
  renderFile(filePath: string, data: any): Promise<string>

  /**
   * 注册辅助函数
   * 
   * @param name 函数名
   * @param fn 函数实现
   */
  registerHelper(name: string, fn: Function): void

  /**
   * 注册过滤器
   * 
   * @param name 过滤器名
   * @param fn 过滤器函数
   */
  registerFilter(name: string, fn: Function): void

  /**
   * 注册片段（partial）
   * 
   * @param name 片段名
   * @param content 片段内容或路径
   */
  registerPartial(name: string, content: string): void

  /**
   * 清除缓存
   */
  clearCache(): void
}



