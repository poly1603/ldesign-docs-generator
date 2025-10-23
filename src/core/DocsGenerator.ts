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
import { EventEmitter } from 'events'

// ESM 中获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 文档生成器
 */
export class DocsGenerator extends EventEmitter {
  private logger: Logger
  private pluginManager: PluginManager
  private parserSystem: ParserSystem
  private options: Required<DocsGeneratorOptions>
  private i18nManager?: any
  private pwaGenerator?: any
  private analyticsManager?: any
  private codeSplitter?: any
  private imageOptimizer?: any

  constructor(options: DocsGeneratorOptions) {
    super()

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

    // 初始化高级功能
    this.initializeAdvancedFeatures()

    this.logger.info('文档生成器初始化完成')
  }

  /**
   * 初始化高级功能
   */
  private async initializeAdvancedFeatures(): Promise<void> {
    // i18n
    if (this.options.i18n) {
      const { createI18nManager } = await import('../i18n')
      this.i18nManager = createI18nManager(this.options.i18n, this.logger.createChild('i18n'))
    }

    // PWA
    if (this.options.pwa?.enabled) {
      const { createManifestGenerator } = await import('../features/pwa')
      this.pwaGenerator = createManifestGenerator(this.options.pwa, this.logger.createChild('pwa'))
    }

    // Analytics
    if (this.options.analytics?.enabled) {
      const { createAnalyticsManager } = await import('../features/analytics')
      this.analyticsManager = createAnalyticsManager(this.options.analytics, this.logger.createChild('analytics'))
    }

    // 构建优化器
    if (this.options.build) {
      const { createCodeSplitter, createImageOptimizer } = await import('../build')

      if (this.options.build.codeSplit?.enabled) {
        this.codeSplitter = createCodeSplitter(this.options.build.codeSplit, this.logger.createChild('code-split'))
      }

      if (this.options.build.imageOptimization?.enabled) {
        this.imageOptimizer = createImageOptimizer(this.options.build.imageOptimization, this.logger.createChild('image-opt'))
      }
    }
  }

  /**
   * 生成文档
   */
  async generate(): Promise<void> {
    const startTime = Date.now()

    try {
      this.logger.info('开始生成文档...')
      this.emit('start')

      // 1. 清理输出目录
      await this.cleanOutputDir()

      // 2. 解析源文件
      this.logger.info('步骤 1/4: 解析源文件')
      this.emit('progress', { step: 1, total: 4, message: '解析源文件' })
      const docNodes = await this.parserSystem.parseAll()

      if (docNodes.length === 0) {
        this.logger.warn('没有找到任何文档节点')
        this.emit('warning', '没有找到任何文档节点')
        return
      }

      // 3. 转换文档节点
      this.logger.info('步骤 2/4: 转换文档节点')
      this.emit('progress', { step: 2, total: 4, message: '转换文档节点' })
      const transformed = await this.parserSystem.transform(docNodes)

      // 4. 生成文档站点
      this.logger.info('步骤 3/4: 生成文档站点')
      this.emit('progress', { step: 3, total: 4, message: '生成文档站点' })
      await this.generateSite(transformed)

      // 5. 执行插件生成钩子
      this.logger.info('步骤 4/4: 执行插件生成钩子')
      this.emit('progress', { step: 4, total: 4, message: '执行插件钩子' })
      await this.executePluginGenerate(transformed)

      const duration = Date.now() - startTime
      this.logger.success(`✨ 文档生成完成！耗时 ${duration}ms`)
      this.logger.info(`📁 输出目录: ${this.options.outputDir}`)
      this.emit('complete', { duration, nodeCount: transformed.length })
    } catch (error) {
      this.logger.error('文档生成失败:', error)
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 构建文档（生成并优化）
   */
  async build(): Promise<void> {
    this.emit('build:start')

    // 生成文档
    await this.generate()

    // PWA
    if (this.pwaGenerator) {
      this.logger.info('生成 PWA 资源...')
      await this.pwaGenerator.generateManifest(this.options.outputDir)
      await this.pwaGenerator.generateServiceWorker(this.options.outputDir)
    }

    // 代码分割
    if (this.codeSplitter) {
      this.logger.info('执行代码分割...')
      const chunks = await this.codeSplitter.analyzeChunks(this.options.outputDir)
      this.logger.info(`代码分割完成，共 ${chunks.length} 个块`)
    }

    // 图片优化
    if (this.imageOptimizer) {
      this.logger.info('优化图片...')
      await this.imageOptimizer.optimizeImages(this.options.sourceDir, this.options.outputDir)
    }

    // 执行构建优化
    const { BuildOptimizer } = await import('./BuildOptimizer')
    const optimizer = new BuildOptimizer({
      outputDir: this.options.outputDir,
      logger: this.logger.createChild('optimizer'),
      minifyHTML: true,
      minifyCSS: true,
      minifyJS: true,
      gzip: false,
      treeShake: true,
    })

    await optimizer.optimize()

    // 注入分析脚本
    if (this.analyticsManager) {
      this.logger.info('注入分析脚本...')
      const scripts = this.analyticsManager.generateAllScripts()
      // 这里需要将脚本注入到 HTML 文件中
    }

    this.emit('build:complete')
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
    const { ThemeResolver } = await import('../themes/ThemeResolver')

    // 解析主题
    const themeResolver = new ThemeResolver(this.logger.createChild('theme'))
    const resolvedTheme = await themeResolver.resolve(
      this.options.theme || { name: 'default' },
      process.cwd()
    )

    const siteEngine = new StaticSiteEngine({
      outputDir: this.options.outputDir,
      config: this.options.site,
      theme: resolvedTheme,
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

