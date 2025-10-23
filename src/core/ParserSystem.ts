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
import { IncrementalParser } from '../parsers/IncrementalParser'
import { SimpleParallelParser } from '../parsers/ParserWorker'

/**
 * 解析系统配置
 */
export interface ParserSystemOptions {
  sourceDir: string
  include?: string[]
  exclude?: string[]
  cacheDir?: string
  logger: Logger
  /** 是否启用增量解析 */
  incremental?: boolean
  /** 并行度 */
  concurrency?: number
  /** 进度回调 */
  onProgress?: (progress: ParseProgress) => void
}

/**
 * 解析进度
 */
export interface ParseProgress {
  /** 当前阶段 */
  stage: 'scan' | 'parse' | 'transform'
  /** 总文件数 */
  total: number
  /** 已完成数 */
  completed: number
  /** 进度百分比 (0-100) */
  percentage: number
  /** 当前文件 */
  currentFile?: string
}

/**
 * 解析系统
 */
export class ParserSystem {
  private pluginManager: PluginManager
  private options: ParserSystemOptions
  private incrementalParser?: IncrementalParser
  private parallelParser?: SimpleParallelParser

  constructor(pluginManager: PluginManager, options: ParserSystemOptions) {
    this.pluginManager = pluginManager
    this.options = {
      incremental: true,
      concurrency: 4,
      ...options,
    }

    // 初始化增量解析器
    if (this.options.incremental && this.options.cacheDir) {
      this.incrementalParser = new IncrementalParser(
        this.options.cacheDir,
        this.options.logger
      )
    }

    // 初始化并行解析器
    if (this.options.concurrency && this.options.concurrency > 1) {
      this.parallelParser = new SimpleParallelParser(
        this.options.logger,
        this.options.concurrency
      )
    }
  }

  /**
   * 解析所有文件
   */
  async parseAll(): Promise<DocNode[]> {
    const startTime = Date.now()
    this.options.logger.info('开始解析文件...')

    // 扫描文件
    this.reportProgress({ stage: 'scan', total: 0, completed: 0, percentage: 0 })
    const files = await this.scanFiles()
    this.options.logger.info(`找到 ${files.length} 个文件`)

    // 增量解析：检测变化的文件
    let filesToParse = files
    let cachedNodes: DocNode[] = []

    if (this.incrementalParser) {
      const changes = await this.incrementalParser.detectChanges(files)
      filesToParse = [...changes.added, ...changes.changed]

      // 从缓存获取未变化文件的结果
      for (const unchangedFile of changes.unchanged) {
        const cached = this.incrementalParser.getCachedResult(unchangedFile)
        if (cached && Array.isArray(cached)) {
          cachedNodes.push(...cached)
        }
      }

      // 清理已删除文件的缓存
      for (const removedFile of changes.removed) {
        this.incrementalParser.removeFromCache(removedFile)
      }

      if (filesToParse.length === 0) {
        this.options.logger.success('所有文件均未变化，使用缓存结果')
        return cachedNodes
      }

      this.options.logger.info(
        `增量解析: 需要解析 ${filesToParse.length} 个文件，缓存 ${changes.unchanged.length} 个文件`
      )
    }

    // 报告解析进度
    this.reportProgress({
      stage: 'parse',
      total: filesToParse.length,
      completed: 0,
      percentage: 0,
    })

    // 创建解析上下文
    const context: ParseContext = {
      files: filesToParse,
      sourceDir: this.options.sourceDir,
      options: {},
      logger: this.options.logger,
      cacheDir: this.options.cacheDir,
    }

    // 执行插件解析
    const result = await this.pluginManager.executeParse(context)

    // 合并缓存的节点
    const allNodes = [...cachedNodes, ...result.nodes]

    // 更新增量解析缓存
    if (this.incrementalParser) {
      for (const file of filesToParse) {
        const fileNodes = result.nodes.filter(node => node.path === file)
        await this.incrementalParser.cacheParseResult(file, fileNodes)
      }
      await this.incrementalParser.saveCache()

      const stats = this.incrementalParser.getCacheStats()
      this.options.logger.debug(
        `增量解析缓存: ${stats.fileCount} 个文件, ${stats.cacheSize}`
      )
    }

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
      `解析完成，共 ${allNodes.length} 个文档节点，耗时 ${duration}ms`
    )

    this.reportProgress({
      stage: 'parse',
      total: filesToParse.length,
      completed: filesToParse.length,
      percentage: 100,
    })

    return allNodes
  }

  /**
   * 报告进度
   */
  private reportProgress(progress: ParseProgress): void {
    if (this.options.onProgress) {
      this.options.onProgress(progress)
    }
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




