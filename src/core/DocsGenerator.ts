/**
 * 文档生成器核心类
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import { fileURLToPath } from 'url'
import type {
  DocsGeneratorOptions,
  DocNode,
  GenerateContext,
  SiteConfig,
  ThemeConfig,
} from '../types'
import { Logger, LogLevel, parseLogLevel } from './Logger'
import { PluginManager } from './PluginManager'
import { ParserSystem } from './ParserSystem'

// ESM 中获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 文档生成器
 */
export class DocsGenerator {
  private logger: Logger
  private pluginManager: PluginManager
  private parserSystem: ParserSystem
  private options: Required<DocsGeneratorOptions>

  constructor(options: DocsGeneratorOptions) {
    // 初始化日志器
    const logLevel = parseLogLevel(options.logLevel)
    this.logger = new Logger(logLevel)

    // 合并默认配置
    this.options = this.mergeDefaultOptions(options)

    // 初始化插件管理器
    this.pluginManager = new PluginManager({
      logger: this.logger.createChild('plugin'),
      cache: true,
      timeout: 30000,
      maxPlugins: 100,
    })

    // 注册插件
    if (this.options.plugins && this.options.plugins.length > 0) {
      this.pluginManager.registerAll(this.options.plugins)
    }

    // 初始化解析系统
    this.parserSystem = new ParserSystem(this.pluginManager, {
      sourceDir: this.options.sourceDir,
      cacheDir: this.options.cacheDir,
      logger: this.logger.createChild('parser'),
    })

    this.logger.info('文档生成器初始化完成')
  }

  /**
   * 生成文档
   */
  async generate(): Promise<void> {
    const startTime = Date.now()

    try {
      this.logger.info('开始生成文档...')

      // 1. 清理输出目录
      await this.cleanOutputDir()

      // 2. 解析源文件
      this.logger.info('步骤 1/4: 解析源文件')
      const docNodes = await this.parserSystem.parseAll()

      if (docNodes.length === 0) {
        this.logger.warn('没有找到任何文档节点')
        return
      }

      // 3. 转换文档节点
      this.logger.info('步骤 2/4: 转换文档节点')
      const transformed = await this.parserSystem.transform(docNodes)

      // 4. 生成文档站点
      this.logger.info('步骤 3/4: 生成文档站点')
      await this.generateSite(transformed)

      // 5. 执行插件生成钩子
      this.logger.info('步骤 4/4: 执行插件生成钩子')
      await this.executePluginGenerate(transformed)

      const duration = Date.now() - startTime
      this.logger.success(`✨ 文档生成完成！耗时 ${duration}ms`)
      this.logger.info(`📁 输出目录: ${this.options.outputDir}`)
    } catch (error) {
      this.logger.error('文档生成失败:', error)
      throw error
    }
  }

  /**
   * 构建文档（生成并优化）
   */
  async build(): Promise<void> {
    await this.generate()
    // TODO: 添加构建优化（压缩、Tree-shaking 等）
  }

  /**
   * 清理
   */
  async cleanup(): Promise<void> {
    this.logger.info('执行清理...')
    await this.pluginManager.executeCleanup()
    this.logger.success('清理完成')
  }

  /**
   * 清理输出目录
   */
  private async cleanOutputDir(): Promise<void> {
    if (await fs.pathExists(this.options.outputDir)) {
      this.logger.debug(`清理输出目录: ${this.options.outputDir}`)
      await fs.emptyDir(this.options.outputDir)
    } else {
      await fs.ensureDir(this.options.outputDir)
    }
  }

  /**
   * 生成站点
   */
  private async generateSite(docs: DocNode[]): Promise<void> {
    // 智能获取模板目录
    const { getTemplateDir, ensureTemplates } = await import('../utils/template-loader')
    const templateDir = getTemplateDir()
    
    // 确保模板可访问
    await ensureTemplates(templateDir)
    
    // 导入 StaticSiteEngine
    const { StaticSiteEngine } = await import('../generators/StaticSiteEngine')
    
    const siteEngine = new StaticSiteEngine({
      outputDir: this.options.outputDir,
      config: this.options.site,
      theme: this.options.theme || { name: 'default' },
      navigation: this.options.navigation || {},
      templateDir,
      logger: this.logger.createChild('site'),
    })
    
    await siteEngine.generate(docs)
    
    this.logger.debug(`站点生成完成，共 ${docs.length} 个页面`)
  }

  /**
   * 执行插件生成钩子
   */
  private async executePluginGenerate(docs: DocNode[]): Promise<void> {
    const context: GenerateContext = {
      docs,
      outputDir: this.options.outputDir,
      siteConfig: this.options.site,
      options: {},
      logger: this.logger.createChild('generate'),
    }

    await this.pluginManager.executeGenerate(context)
  }

  /**
   * 合并默认配置
   */
  private mergeDefaultOptions(
    options: DocsGeneratorOptions
  ): Required<DocsGeneratorOptions> {
    const defaultSite: SiteConfig = {
      title: '文档站点',
      description: '',
      lang: 'zh-CN',
      darkMode: true,
    }

    const defaultTheme: ThemeConfig = {
      name: 'default',
    }

    return {
      sourceDir: options.sourceDir,
      outputDir: options.outputDir,
      plugins: options.plugins || [],
      site: { ...defaultSite, ...options.site },
      theme: { ...defaultTheme, ...options.theme },
      navigation: options.navigation || {},
      cacheDir: options.cacheDir || path.join(process.cwd(), '.cache', 'docs-generator'),
      logLevel: options.logLevel || 'info',
    }
  }
}

/**
 * 创建文档生成器
 */
export function createDocsGenerator(
  options: DocsGeneratorOptions
): DocsGenerator {
  return new DocsGenerator(options)
}

