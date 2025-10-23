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
import { PluginDependencyResolver } from '../plugins/PluginDependencyResolver'
import { ValidationError } from './errors'

/**
 * 插件管理器
 */
export class PluginManager {
  private logger: Logger
  private plugins: Map<string, DocsPlugin> = new Map()
  private orderedPlugins: DocsPlugin[] = []
  private options: PluginManagerOptions
  private dependencyResolver: PluginDependencyResolver
  private hotReloadEnabled: boolean = false

  constructor(options: PluginManagerOptions = {}) {
    this.options = {
      cache: true,
      timeout: 30000,
      maxPlugins: 100,
      ...options,
    }
    this.logger = options.logger!
    this.dependencyResolver = new PluginDependencyResolver(this.logger)
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
    const results = plugins.map((plugin) => this.register(plugin))

    // 解析依赖并排序
    try {
      this.resolveDependencies()
    } catch (error) {
      this.logger.error('插件依赖解析失败:', error)
      throw error
    }

    return results
  }

  /**
   * 解析插件依赖
   */
  private resolveDependencies(): void {
    this.dependencyResolver.clear()

    // 添加所有插件到依赖解析器
    for (const plugin of this.plugins.values()) {
      this.dependencyResolver.addPlugin(plugin)
    }

    // 验证依赖
    const missingDeps = this.dependencyResolver.validateDependencies()
    if (missingDeps.length > 0) {
      this.logger.warn(`发现缺失的插件依赖:\n${missingDeps.join('\n')}`)
    }

    // 解析并排序
    this.orderedPlugins = this.dependencyResolver.resolve()
    this.logger.debug(`插件已按依赖顺序排序: ${this.orderedPlugins.map(p => p.name).join(' -> ')}`)
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

    // 使用排序后的插件列表
    const plugins = this.orderedPlugins.length > 0 ? this.orderedPlugins : Array.from(this.plugins.values())

    // 执行 beforeParse 钩子
    for (const plugin of plugins) {
      if (!plugin.beforeParse) continue

      try {
        this.logger.debug(`执行插件 ${plugin.name} 的 beforeParse 钩子`)
        await this.executeWithTimeout(
          plugin.beforeParse(context),
          `插件 ${plugin.name} beforeParse 超时`
        )
      } catch (error) {
        this.logger.error(`插件 ${plugin.name} beforeParse 失败:`, error)
      }
    }

    // 执行 parse 钩子
    let currentResult: ParseResult = { nodes: [] }
    for (const plugin of plugins) {
      if (!plugin.parse) continue

      try {
        this.logger.debug(`执行插件 ${plugin.name} 的 parse 钩子`)
        const result = await this.executeWithTimeout(
          plugin.parse(context),
          `插件 ${plugin.name} 解析超时`
        )

        allNodes.push(...result.nodes)
        if (result.errors) allErrors.push(...result.errors)
        if (result.warnings) allWarnings.push(...result.warnings)

        currentResult = result
      } catch (error) {
        this.logger.error(`插件 ${plugin.name} 解析失败:`, error)
        allErrors.push(error as Error)
      }
    }

    // 执行 afterParse 钩子
    let finalResult: ParseResult = {
      nodes: allNodes,
      errors: allErrors.length > 0 ? allErrors : undefined,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
    }

    for (const plugin of plugins) {
      if (!plugin.afterParse) continue

      try {
        this.logger.debug(`执行插件 ${plugin.name} 的 afterParse 钩子`)
        finalResult = await this.executeWithTimeout(
          plugin.afterParse(finalResult, context),
          `插件 ${plugin.name} afterParse 超时`
        )
      } catch (error) {
        this.logger.error(`插件 ${plugin.name} afterParse 失败:`, error)
      }
    }

    return finalResult
  }

  /**
   * 执行转换钩子
   */
  async executeTransform(docs: DocNode[], context: ParseContext): Promise<DocNode[]> {
    let transformedDocs = docs
    const plugins = this.orderedPlugins.length > 0 ? this.orderedPlugins : Array.from(this.plugins.values())

    // 执行 beforeTransform 钩子
    for (const plugin of plugins) {
      if (!plugin.beforeTransform) continue

      try {
        this.logger.debug(`执行插件 ${plugin.name} 的 beforeTransform 钩子`)
        await this.executeWithTimeout(
          plugin.beforeTransform(transformedDocs, context),
          `插件 ${plugin.name} beforeTransform 超时`
        )
      } catch (error) {
        this.logger.error(`插件 ${plugin.name} beforeTransform 失败:`, error)
      }
    }

    // 执行 transform 钩子
    for (const plugin of plugins) {
      if (!plugin.transform) continue

      try {
        this.logger.debug(`执行插件 ${plugin.name} 的 transform 钩子`)
        transformedDocs = await this.executeWithTimeout(
          plugin.transform(transformedDocs, context),
          `插件 ${plugin.name} 转换超时`
        )
      } catch (error) {
        this.logger.error(`插件 ${plugin.name} 转换失败:`, error)
      }
    }

    // 执行 afterTransform 钩子
    for (const plugin of plugins) {
      if (!plugin.afterTransform) continue

      try {
        this.logger.debug(`执行插件 ${plugin.name} 的 afterTransform 钩子`)
        transformedDocs = await this.executeWithTimeout(
          plugin.afterTransform(transformedDocs, context),
          `插件 ${plugin.name} afterTransform 超时`
        )
      } catch (error) {
        this.logger.error(`插件 ${plugin.name} afterTransform 失败:`, error)
      }
    }

    return transformedDocs
  }

  /**
   * 执行生成钩子
   */
  async executeGenerate(context: GenerateContext): Promise<void> {
    const plugins = this.orderedPlugins.length > 0 ? this.orderedPlugins : Array.from(this.plugins.values())

    // 执行 beforeGenerate 钩子
    for (const plugin of plugins) {
      if (!plugin.beforeGenerate) continue

      try {
        this.logger.debug(`执行插件 ${plugin.name} 的 beforeGenerate 钩子`)
        await this.executeWithTimeout(
          plugin.beforeGenerate(context),
          `插件 ${plugin.name} beforeGenerate 超时`
        )
      } catch (error) {
        this.logger.error(`插件 ${plugin.name} beforeGenerate 失败:`, error)
      }
    }

    // 执行 generate 钩子
    for (const plugin of plugins) {
      if (!plugin.generate) continue

      try {
        this.logger.debug(`执行插件 ${plugin.name} 的 generate 钩子`)
        await this.executeWithTimeout(
          plugin.generate(context),
          `插件 ${plugin.name} 生成超时`
        )
      } catch (error) {
        this.logger.error(`插件 ${plugin.name} 生成失败:`, error)
      }
    }

    // 执行 afterGenerate 钩子
    for (const plugin of plugins) {
      if (!plugin.afterGenerate) continue

      try {
        this.logger.debug(`执行插件 ${plugin.name} 的 afterGenerate 钩子`)
        await this.executeWithTimeout(
          plugin.afterGenerate(context),
          `插件 ${plugin.name} afterGenerate 超时`
        )
      } catch (error) {
        this.logger.error(`插件 ${plugin.name} afterGenerate 失败:`, error)
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

    const hasAnyHook = plugin.parse || plugin.transform || plugin.generate ||
      plugin.beforeParse || plugin.afterParse ||
      plugin.beforeTransform || plugin.afterTransform ||
      plugin.beforeGenerate || plugin.afterGenerate

    if (!hasAnyHook) {
      throw new Error('插件必须至少实现一个生命周期钩子')
    }

    // 验证插件配置
    if (plugin.configSchema && plugin.config) {
      this.validatePluginConfig(plugin)
    }
  }

  /**
   * 验证插件配置
   */
  private validatePluginConfig(plugin: DocsPlugin): void {
    const schema = plugin.configSchema!
    const config = plugin.config

    if (schema.type !== 'object') {
      throw new ValidationError(
        `插件 ${plugin.name} 的配置 Schema 必须是 object 类型`,
        { plugin: plugin.name, schema }
      )
    }

    // 验证必填字段
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in config)) {
          throw new ValidationError(
            `插件 ${plugin.name} 缺少必填配置项: ${field}`,
            { plugin: plugin.name, field, config }
          )
        }
      }
    }

    // 验证字段类型
    for (const [key, value] of Object.entries(config)) {
      const propSchema = schema.properties[key]
      if (!propSchema) {
        this.logger.warn(`插件 ${plugin.name} 配置中有未定义的字段: ${key}`)
        continue
      }

      const actualType = Array.isArray(value) ? 'array' : typeof value
      if (actualType !== propSchema.type) {
        throw new ValidationError(
          `插件 ${plugin.name} 配置项 ${key} 类型错误: 期望 ${propSchema.type}, 实际 ${actualType}`,
          { plugin: plugin.name, key, expected: propSchema.type, actual: actualType }
        )
      }
    }

    this.logger.debug(`插件 ${plugin.name} 配置验证通过`)
  }

  /**
   * 启用热重载
   */
  enableHotReload(): void {
    this.hotReloadEnabled = true
    this.logger.info('插件热重载已启用')
  }

  /**
   * 禁用热重载
   */
  disableHotReload(): void {
    this.hotReloadEnabled = false
    this.logger.info('插件热重载已禁用')
  }

  /**
   * 重载插件
   */
  async reloadPlugin(pluginName: string, newPlugin: DocsPlugin): Promise<boolean> {
    if (!this.hotReloadEnabled) {
      this.logger.warn('热重载未启用')
      return false
    }

    if (!this.plugins.has(pluginName)) {
      this.logger.warn(`插件 ${pluginName} 不存在`)
      return false
    }

    try {
      // 先执行旧插件的清理
      const oldPlugin = this.plugins.get(pluginName)!
      if (oldPlugin.cleanup) {
        await oldPlugin.cleanup()
      }

      // 注册新插件
      const result = this.register(newPlugin)
      if (!result.success) {
        throw result.error
      }

      // 重新解析依赖
      this.resolveDependencies()

      this.logger.success(`插件 ${pluginName} 已重载`)
      return true
    } catch (error) {
      this.logger.error(`插件 ${pluginName} 重载失败:`, error)
      return false
    }
  }

  /**
   * 获取插件信息（用于调试）
   */
  getPluginInfo(): Array<{
    name: string
    version: string
    author?: string
    description?: string
    dependencies?: string[]
  }> {
    return this.orderedPlugins.map(p => ({
      name: p.name,
      version: p.version,
      author: p.author,
      description: p.description,
      dependencies: p.dependencies,
    }))
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




