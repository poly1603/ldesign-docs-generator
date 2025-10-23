/**
 * @ldesign/docs-generator - 文档生成器
 * 
 * API 文档自动生成、组件文档、交互式示例、多版本支持、AI 增强
 */

// 核心导出
export { DocsGenerator, createDocsGenerator } from './core/DocsGenerator'
export { PluginManager } from './core/PluginManager'
export { ParserSystem, type ParseProgress, type ParserSystemOptions } from './core/ParserSystem'
export { Logger, LogLevel, parseLogLevel } from './core/Logger'
export { ConfigValidator, createValidator } from './core/ConfigValidator'
export { CacheManager } from './core/CacheManager'
export { PluginDependencyResolver } from './plugins/PluginDependencyResolver'
export { IncrementalParser } from './parsers/IncrementalParser'
export { ParserWorkerPool, SimpleParallelParser } from './parsers/ParserWorker'

// Vite 开发服务器
export { createDevServer, startDevServer, stopDevServer } from './vite/dev-server'
export type { DevServerOptions } from './vite/dev-server'

// Vite 插件
export { createMarkdownPlugin } from './vite/plugins/markdown'
export { createConfigHotReloadPlugin } from './vite/plugins/config'
export { createVueComponentPlugin } from './vite/plugins/vue-component'

// 错误处理
export * from './core/errors'

// 生成器导出
export * from './generators'
export { templateHelpers, registerTemplateHelpers } from './generators/template-helpers'

// 解析器插件导出
export * from './plugins/parsers'

// 增强插件导出
export * from './plugins/enhancements'

// 集成插件导出
export * from './plugins/integrations'

// Playground 插件导出
export * from './plugins/playground'

// 功能模块导出
export * from './features/search'
export { VersionManager, type VersionManagerOptions } from './features/versioning/VersionManager'
export * from './features/navigation'
export * from './features/pwa'
export * from './features/comments'
export * from './features/analytics'

// 主题系统导出
export * from './themes'

// 构建优化导出
export * from './build'

// 配置系统导出
export * from './config'

// i18n 导出
export * from './i18n'

// Markdown 增强导出
export * from './markdown'

// 工具函数导出
export * from './utils'

// 类型导出
export * from './types'

// 配置助手
export { defineConfig } from './types'

