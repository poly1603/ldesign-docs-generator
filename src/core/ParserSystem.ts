/**
 * 解析系统
 */

import { glob } from 'glob'
import type {
  Logger,
  ParseContext,
  ParseResult,
  DocNode,
} from '../types'
import type { PluginManager } from './PluginManager'

/**
 * 解析系统配置
 */
export interface ParserSystemOptions {
  sourceDir: string
  include?: string[]
  exclude?: string[]
  cacheDir?: string
  logger: Logger
}

/**
 * 解析系统
 */
export class ParserSystem {
  private pluginManager: PluginManager
  private options: ParserSystemOptions

  constructor(pluginManager: PluginManager, options: ParserSystemOptions) {
    this.pluginManager = pluginManager
    this.options = options
  }

  /**
   * 解析所有文件
   */
  async parseAll(): Promise<DocNode[]> {
    const startTime = Date.now()
    this.options.logger.info('开始解析文件...')

    // 扫描文件
    const files = await this.scanFiles()
    this.options.logger.info(`找到 ${files.length} 个文件`)

    // 创建解析上下文
    const context: ParseContext = {
      files,
      sourceDir: this.options.sourceDir,
      options: {},
      logger: this.options.logger,
      cacheDir: this.options.cacheDir,
    }

    // 执行插件解析
    const result = await this.pluginManager.executeParse(context)

    // 处理错误和警告
    if (result.errors && result.errors.length > 0) {
      this.options.logger.error(`解析过程中发生 ${result.errors.length} 个错误`)
      result.errors.forEach((error) => {
        this.options.logger.error(error.message)
      })
    }

    if (result.warnings && result.warnings.length > 0) {
      this.options.logger.warn(`解析过程中发生 ${result.warnings.length} 个警告`)
      result.warnings.forEach((warning) => {
        this.options.logger.warn(warning)
      })
    }

    const duration = Date.now() - startTime
    this.options.logger.success(
      `解析完成，共 ${result.nodes.length} 个文档节点，耗时 ${duration}ms`
    )

    return result.nodes
  }

  /**
   * 转换文档节点
   */
  async transform(docs: DocNode[]): Promise<DocNode[]> {
    this.options.logger.info('开始转换文档节点...')

    const context: ParseContext = {
      files: [],
      sourceDir: this.options.sourceDir,
      options: {},
      logger: this.options.logger,
      cacheDir: this.options.cacheDir,
    }

    const transformed = await this.pluginManager.executeTransform(docs, context)
    this.options.logger.success(`转换完成，共 ${transformed.length} 个文档节点`)

    return transformed
  }

  /**
   * 扫描文件
   */
  private async scanFiles(): Promise<string[]> {
    const include = this.options.include || ['**/*.{ts,tsx,js,jsx,vue,md}']
    const exclude = this.options.exclude || [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/coverage/**',
    ]

    const files: string[] = []

    for (const pattern of include) {
      const matches = await glob(pattern, {
        cwd: this.options.sourceDir,
        ignore: exclude,
        absolute: true,
      })
      files.push(...matches)
    }

    // 去重
    return Array.from(new Set(files))
  }
}




