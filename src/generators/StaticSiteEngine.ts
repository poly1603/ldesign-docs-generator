/**
 * 静态站点引擎
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import type {
  DocNode,
  SiteOptions,
  Navigation,
  TemplateData,
  Logger,
} from '../types'
import { TemplateEngine } from './TemplateEngine'
import { ThemeManager } from './ThemeManager'
import { NavigationBuilder } from './NavigationBuilder'

/**
 * 静态站点引擎选项
 */
export interface StaticSiteEngineOptions extends SiteOptions {
  /** 模板目录 */
  templateDir: string
  /** 日志器 */
  logger: Logger
}

/**
 * 静态站点引擎
 */
export class StaticSiteEngine {
  private templateEngine: TemplateEngine
  private themeManager: ThemeManager
  private navigationBuilder: NavigationBuilder
  private options: StaticSiteEngineOptions

  constructor(options: StaticSiteEngineOptions) {
    this.options = options

    // 初始化模板引擎
    this.templateEngine = new TemplateEngine({
      templateDir: options.templateDir,
      logger: options.logger.createChild?.('template') || options.logger,
      cache: true,
    })

    // 初始化主题管理器
    this.themeManager = new ThemeManager({
      themeConfig: options.theme,
      builtinThemesDir: path.join(options.templateDir, 'themes'),
      logger: options.logger.createChild?.('theme') || options.logger,
    })

    // 初始化导航构建器
    this.navigationBuilder = new NavigationBuilder({
      config: options.navigation,
      logger: options.logger.createChild?.('nav') || options.logger,
    })
  }

  /**
   * 生成站点
   */
  async generate(docs: DocNode[]): Promise<void> {
    const { logger, outputDir } = this.options

    logger.info('开始生成静态站点...')

    // 1. 构建导航
    const navigation = this.navigationBuilder.build(docs)

    // 2. 生成页面
    await this.generatePages(docs, navigation)

    // 3. 生成索引
    await this.generateIndex(docs, navigation)

    // 4. 复制静态资源
    await this.copyAssets()

    // 5. 生成搜索索引
    await this.generateSearchIndex(docs)

    logger.success('静态站点生成完成')
  }

  /**
   * 生成页面
   */
  private async generatePages(docs: DocNode[], navigation: Navigation): Promise<void> {
    const { logger, outputDir } = this.options

    for (const doc of docs) {
      try {
        await this.renderPage(doc, navigation, outputDir)
        logger.debug(`页面已生成: ${doc.outputPath}`)
      } catch (error) {
        logger.error(`页面生成失败: ${doc.outputPath}`, error)
      }
    }
  }

  /**
   * 渲染页面
   */
  private async renderPage(
    doc: DocNode,
    navigation: Navigation,
    outputDir: string
  ): Promise<void> {
    // 准备数据
    const data: TemplateData = {
      doc,
      navigation,
      site: this.options.config,
      theme: this.themeManager.currentTheme,
      title: this.generateTitle(doc),
      breadcrumb: navigation.breadcrumb(doc.outputPath || ''),
      toc: navigation.toc(doc),
    }

    // 先渲染内容模板
    const contentTemplate = this.themeManager.getTemplate(doc.type)
    const contentHtml = await this.templateEngine.render(contentTemplate, data)

    // 再用 layout 包裹
    const layoutTemplate = this.themeManager.getTemplate('layout')
    const finalHtml = await this.templateEngine.render(layoutTemplate, {
      ...data,
      body: contentHtml,
    })

    // 写入文件
    const outputPath = path.join(outputDir, doc.outputPath || 'index.html')
    await fs.ensureDir(path.dirname(outputPath))
    await fs.writeFile(outputPath, finalHtml, 'utf-8')
  }

  /**
   * 生成标题
   */
  private generateTitle(doc: DocNode): string {
    const { config } = this.options
    return `${doc.name} | ${config.title}`
  }

  /**
   * 生成索引页
   */
  private async generateIndex(docs: DocNode[], navigation: Navigation): Promise<void> {
    const { logger, outputDir, config } = this.options

    const data: TemplateData = {
      doc: {
        type: 'custom',
        name: config.title,
        path: '',
        outputPath: 'index.html',
        metadata: {},
        content: {},
      },
      navigation,
      site: config,
      theme: this.themeManager.currentTheme,
      title: config.title,
      breadcrumb: [],
      toc: [],
      docs,
      stats: {
        total: docs.length,
        api: docs.filter((d) => d.type === 'api').length,
        component: docs.filter((d) => d.type === 'component').length,
        markdown: docs.filter((d) => d.type === 'markdown').length,
      },
    }

    // 先渲染内容模板
    const indexTemplate = this.themeManager.getTemplate('index')
    const contentHtml = await this.templateEngine.render(indexTemplate, data)

    // 再用 layout 包裹
    const layoutTemplate = this.themeManager.getTemplate('layout')
    const finalHtml = await this.templateEngine.render(layoutTemplate, {
      ...data,
      body: contentHtml,
    })

    // 写入文件
    const outputPath = path.join(outputDir, 'index.html')
    await fs.writeFile(outputPath, finalHtml, 'utf-8')

    logger.debug('索引页已生成')
  }

  /**
   * 复制静态资源
   */
  private async copyAssets(): Promise<void> {
    const { logger, outputDir, templateDir } = this.options

    // 复制主题资源
    await this.themeManager.copyAssets(outputDir)

    // 复制公共资源
    const publicDir = path.join(templateDir, 'public')
    if (await fs.pathExists(publicDir)) {
      const assetsDir = path.join(outputDir, 'assets')
      await fs.copy(publicDir, assetsDir)
      logger.debug('公共资源已复制')
    }
  }

  /**
   * 生成搜索索引
   */
  private async generateSearchIndex(docs: DocNode[]): Promise<void> {
    const { logger, outputDir } = this.options

    const searchIndex = docs.map((doc) => ({
      id: doc.outputPath || '',
      title: doc.name,
      type: doc.type,
      path: doc.outputPath || '',
      content: this.extractSearchContent(doc),
    }))

    const indexPath = path.join(outputDir, 'search-index.json')
    await fs.writeJSON(indexPath, searchIndex, { spaces: 2 })

    logger.debug('搜索索引已生成')
  }

  /**
   * 提取搜索内容
   */
  private extractSearchContent(doc: DocNode): string {
    if (doc.type === 'markdown') {
      return (doc.content as any).raw || ''
    }

    if (doc.type === 'component') {
      const content = doc.content as any
      return `${content.description || ''} ${content.props?.map((p: any) => p.name).join(' ')}`
    }

    if (doc.type === 'api') {
      const content = doc.content as any
      return content.comments?.[0]?.summary || ''
    }

    return ''
  }
}

