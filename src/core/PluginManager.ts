/**
 * 插件管理器
 */

import type {
  DocsPlugin,
  PluginManagerOptions,
  PluginLoadResult,
  Logger,
  ParseContext,
  ParseResult,
  DocNode,
  GenerateContext,
} from '../types'

/**
 * 插件管理器
 */
export class PluginManager {
  private logger: Logger
  private plugins: Map<string, DocsPlugin> = new Map()
  private options: PluginManagerOptions

  constructor(options: PluginManagerOptions = {}) {
    this.options = {
      cache: true,
      timeout: 30000,
      maxPlugins: 100,
      ...options,
    }
    this.logger = options.logger!
  }

  /**
   * 注册插件
   */
  register(plugin: DocsPlugin): PluginLoadResult {
    try {
      // 检查插件是否已存在
      if (this.plugins.has(plugin.name)) {
        this.logger.warn(`插件 ${plugin.name} 已存在，将被覆盖`)
      }

      // 检查插件数量限制
      if (this.plugins.size >= this.options.maxPlugins!) {
        throw new Error(`插件数量超过限制 (${this.options.maxPlugins})`)
      }

      // 验证插件
      this.validatePlugin(plugin)

      // 注册插件
      this.plugins.set(plugin.name, plugin)
      this.logger.debug(`插件 ${plugin.name}@${plugin.version} 已注册`)

      return { success: true, plugin }
    } catch (error) {
      this.logger.error(`插件 ${plugin.name} 注册失败:`, error)
      return { success: false, error: error as Error }
    }
  }

  /**
   * 注册多个插件
   */
  registerAll(plugins: DocsPlugin[]): PluginLoadResult[] {
    return plugins.map((plugin) => this.register(plugin))
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): DocsPlugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): DocsPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 执行解析钩子
   */
  async executeParse(context: ParseContext): Promise<ParseResult> {
    const allNodes: DocNode[] = []
    const allErrors: Error[] = []
    const allWarnings: string[] = []

    for (const plugin of this.plugins.values()) {
      if (!plugin.parse) continue

      try {
        this.logger.debug(`执行插件 ${plugin.name} 的解析钩子`)
        const result = await this.executeWithTimeout(
          plugin.parse(context),
          `插件 ${plugin.name} 解析超时`
        )

        allNodes.push(...result.nodes)
        if (result.errors) allErrors.push(...result.errors)
        if (result.warnings) allWarnings.push(...result.warnings)
      } catch (error) {
        this.logger.error(`插件 ${plugin.name} 解析失败:`, error)
        allErrors.push(error as Error)
      }
    }

    return {
      nodes: allNodes,
      errors: allErrors.length > 0 ? allErrors : undefined,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
    }
  }

  /**
   * 执行转换钩子
   */
  async executeTransform(docs: DocNode[], context: ParseContext): Promise<DocNode[]> {
    let transformedDocs = docs

    for (const plugin of this.plugins.values()) {
      if (!plugin.transform) continue

      try {
        this.logger.debug(`执行插件 ${plugin.name} 的转换钩子`)
        transformedDocs = await this.executeWithTimeout(
          plugin.transform(transformedDocs, context),
          `插件 ${plugin.name} 转换超时`
        )
      } catch (error) {
        this.logger.error(`插件 ${plugin.name} 转换失败:`, error)
      }
    }

    return transformedDocs
  }

  /**
   * 执行生成钩子
   */
  async executeGenerate(context: GenerateContext): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (!plugin.generate) continue

      try {
        this.logger.debug(`执行插件 ${plugin.name} 的生成钩子`)
        await this.executeWithTimeout(
          plugin.generate(context),
          `插件 ${plugin.name} 生成超时`
        )
      } catch (error) {
        this.logger.error(`插件 ${plugin.name} 生成失败:`, error)
      }
    }
  }

  /**
   * 执行清理钩子
   */
  async executeCleanup(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (!plugin.cleanup) continue

      try {
        this.logger.debug(`执行插件 ${plugin.name} 的清理钩子`)
        await plugin.cleanup()
      } catch (error) {
        this.logger.error(`插件 ${plugin.name} 清理失败:`, error)
      }
    }
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    this.plugins.clear()
    this.logger.debug('所有插件已清空')
  }

  /**
   * 验证插件
   */
  private validatePlugin(plugin: DocsPlugin): void {
    if (!plugin.name) {
      throw new Error('插件必须有 name 属性')
    }

    if (!plugin.version) {
      throw new Error('插件必须有 version 属性')
    }

    if (!plugin.parse && !plugin.transform && !plugin.generate) {
      throw new Error('插件必须至少实现 parse、transform 或 generate 钩子之一')
    }
  }

  /**
   * 带超时的执行
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMessage: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(timeoutMessage)), this.options.timeout)
      ),
    ])
  }
}




