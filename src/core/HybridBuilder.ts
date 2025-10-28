/**
 * 混合构建器
 * 结合 SPA 和 SSG 的优势，提供最优性能输出
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import { build as viteBuild } from 'vite'
import vue from '@vitejs/plugin-vue'
import type { DocNode, Logger, DocsGeneratorOptions } from '../types'
import type { RouteData } from '../app/route-data-generator'
import { generateRouteData, writeRouteData } from '../app/route-data-generator'
import { createRouteDataPlugin, createDocNodeDataPlugin } from '../vite/plugins/route-data'
import { createMarkdownPlugin } from '../vite/plugins/markdown'
import { StaticSiteEngine } from '../generators/StaticSiteEngine'
import { SearchIndexBuilder } from '../features/search/SearchIndexBuilder'

/**
 * 构建选项
 */
export interface HybridBuilderOptions {
  docs: DocNode[]
  config: DocsGeneratorOptions
  logger: Logger
  mode: 'spa' | 'ssg' | 'hybrid'
}

/**
 * 混合构建器
 */
export class HybridBuilder {
  private docs: DocNode[]
  private config: DocsGeneratorOptions
  private logger: Logger
  private mode: 'spa' | 'ssg' | 'hybrid'

  constructor(options: HybridBuilderOptions) {
    this.docs = options.docs
    this.config = options.config
    this.logger = options.logger
    this.mode = options.mode
  }

  /**
   * 执行构建
   */
  async build(): Promise<void> {
    const startTime = Date.now()

    this.logger.info(`🏗️  开始 ${this.mode.toUpperCase()} 模式构建...`)

    switch (this.mode) {
      case 'spa':
        await this.buildSPA()
        break

      case 'ssg':
        await this.buildSSG()
        break

      case 'hybrid':
        await this.buildHybrid()
        break
    }

    const duration = Date.now() - startTime
    this.logger.success(`✨ 构建完成！耗时 ${(duration / 1000).toFixed(2)}s`)
  }

  /**
   * SPA 构建
   */
  private async buildSPA(): Promise<void> {
    this.logger.info('📦 构建 SPA 应用...')

    // 生成路由数据
    const routeData = await generateRouteData(this.docs)
    const cacheDir = this.config.cacheDir || path.join(process.cwd(), '.cache', 'docs-generator')
    await writeRouteData(routeData, cacheDir)

    // 确保输出目录存在
    await fs.ensureDir(this.config.outputDir)

    // Vite 构建
    await viteBuild({
      configFile: false,
      root: process.cwd(),
      base: this.config.site?.base || '/',

      build: {
        outDir: this.config.outputDir,
        emptyOutDir: true,
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, '../../templates/index.html'),
          },
        },
      },

      plugins: [
        vue(),
        createRouteDataPlugin(routeData),
        createMarkdownPlugin({
          sourceDir: this.config.sourceDir,
          logger: this.logger,
          markdown: this.config.markdown,
        }),
        createDocNodeDataPlugin(this.docs),
      ],

      resolve: {
        alias: {
          '@': this.config.sourceDir,
          '~': this.config.outputDir,
        },
      },

      ...this.config.vite,
    })

    // 生成搜索索引
    await this.buildSearchIndex(routeData)

    this.logger.info(`✓ SPA 构建完成 (${this.docs.length} 个文档)`)
  }

  /**
   * SSG 构建（纯静态）
   */
  private async buildSSG(): Promise<void> {
    this.logger.info('📄 生成静态站点...')

    // 使用现有的 StaticSiteEngine
    const { getTemplateDir, ensureTemplates } = await import('../utils/template-loader')
    const { ThemeResolver } = await import('../themes/ThemeResolver')

    const templateDir = getTemplateDir()
    await ensureTemplates(templateDir)

    const themeResolver = new ThemeResolver(this.logger.createChild('theme'))
    const resolvedTheme = await themeResolver.resolve(
      this.config.theme || { name: 'default' },
      process.cwd()
    )

    const siteEngine = new StaticSiteEngine({
      outputDir: this.config.outputDir,
      config: this.config.site,
      theme: resolvedTheme,
      navigation: this.config.navigation || {},
      templateDir,
      logger: this.logger.createChild('site'),
    })

    await siteEngine.generate(this.docs)

    this.logger.info(`✓ 静态站点生成完成 (${this.docs.length} 个页面)`)
  }

  /**
   * 混合构建（推荐）
   */
  private async buildHybrid(): Promise<void> {
    this.logger.info('🔀 混合构建模式...')

    // 1. 构建 SPA
    this.logger.info('步骤 1/3: 构建 SPA')
    await this.buildSPA()

    // 2. 预渲染关键页面
    this.logger.info('步骤 2/3: 预渲染关键页面')
    await this.prerenderPages()

    // 3. 生成额外资源
    this.logger.info('步骤 3/3: 生成额外资源')
    await this.generateAdditionalAssets()

    this.logger.info('✓ 混合构建完成')
  }

  /**
   * 预渲染关键页面（首页、404 等）
   */
  private async prerenderPages(): Promise<void> {
    // 选择需要预渲染的页面
    const criticalPages = this.docs.filter(doc => {
      // 预渲染首页
      if (doc.path === 'index.md' || doc.path === 'README.md') {
        return true
      }
      // 预渲染配置了 prerender 的页面
      if (doc.metadata.prerender === true) {
        return true
      }
      return false
    })

    if (criticalPages.length === 0) {
      this.logger.debug('没有需要预渲染的页面')
      return
    }

    this.logger.info(`预渲染 ${criticalPages.length} 个关键页面...`)

    // 使用 StaticSiteEngine 只渲染关键页面
    const { getTemplateDir } = await import('../utils/template-loader')
    const { ThemeResolver } = await import('../themes/ThemeResolver')

    const templateDir = getTemplateDir()
    const themeResolver = new ThemeResolver(this.logger.createChild('theme'))
    const resolvedTheme = await themeResolver.resolve(
      this.config.theme || { name: 'default' },
      process.cwd()
    )

    const siteEngine = new StaticSiteEngine({
      outputDir: this.config.outputDir,
      config: this.config.site,
      theme: resolvedTheme,
      navigation: this.config.navigation || {},
      templateDir,
      logger: this.logger.createChild('prerender'),
    })

    // 只渲染关键页面
    await siteEngine.generate(criticalPages)

    this.logger.info(`✓ 预渲染完成`)
  }

  /**
   * 生成额外资源
   */
  private async generateAdditionalAssets(): Promise<void> {
    // sitemap.xml
    await this.generateSitemap()

    // robots.txt
    await this.generateRobotsTxt()
  }

  /**
   * 生成搜索索引
   */
  private async buildSearchIndex(routeData: RouteData): Promise<void> {
    this.logger.info('🔍 生成搜索索引...')

    const searchIndexBuilder = new SearchIndexBuilder({
      outputDir: this.config.outputDir,
      logger: this.logger.createChild('search'),
    })

    await searchIndexBuilder.build(this.docs)

    // 同时写入路由数据中的搜索索引
    const searchIndexPath = path.join(this.config.outputDir, 'search-index.json')
    await fs.writeJSON(searchIndexPath, routeData.searchIndex, { spaces: 2 })

    this.logger.info(`✓ 搜索索引已生成 (${routeData.searchIndex.length} 项)`)
  }

  /**
   * 生成 sitemap.xml
   */
  private async generateSitemap(): Promise<void> {
    const siteUrl = this.config.site?.base || 'https://example.com'
    const urls = this.docs.map(doc => {
      const path = doc.outputPath
        ? '/' + doc.outputPath.replace(/\.html$/, '')
        : '/' + doc.path.replace(/\.md$/, '')

      return `  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    })

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

    const sitemapPath = path.join(this.config.outputDir, 'sitemap.xml')
    await fs.writeFile(sitemapPath, sitemap, 'utf-8')

    this.logger.debug('✓ sitemap.xml 已生成')
  }

  /**
   * 生成 robots.txt
   */
  private async generateRobotsTxt(): Promise<void> {
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${this.config.site?.base || 'https://example.com'}/sitemap.xml`

    const robotsPath = path.join(this.config.outputDir, 'robots.txt')
    await fs.writeFile(robotsPath, robotsTxt, 'utf-8')

    this.logger.debug('✓ robots.txt 已生成')
  }
}

/**
 * 创建混合构建器
 */
export function createHybridBuilder(options: HybridBuilderOptions): HybridBuilder {
  return new HybridBuilder(options)
}
