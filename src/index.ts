/**
 * @ldesign/docs-generator - 文档生成器
 * 
 * API 文档自动生成、组件文档、交互式示例、多版本支持、AI 增强
 */

// 核心导出
export { DocsGenerator, createDocsGenerator } from './core/DocsGenerator'
export { PluginManager } from './core/PluginManager'
export { ParserSystem } from './core/ParserSystem'
export { Logger, LogLevel, parseLogLevel } from './core/Logger'
export { ConfigValidator, createValidator } from './core/ConfigValidator'
export { CacheManager } from './core/CacheManager'

// 错误处理
export * from './core/errors'

// 生成器导出
export * from './generators'
export { templateHelpers, registerTemplateHelpers } from './generators/template-helpers'

// 解析器插件导出
export * from './plugins/parsers'

// 工具函数导出
export * from './utils'

// 类型导出
export * from './types'

// 配置助手
export { defineConfig } from './types'

