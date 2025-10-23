/**
 * @ldesign/docs-generator - 类型定义
 */

import type { InlineConfig as ViteConfig } from 'vite'

/**
 * 日志接口
 */
export interface Logger {
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  debug(message: string, ...args: any[]): void
  success(message: string, ...args: any[]): void
  createChild?: (name: string) => Logger
}

/**
 * 文档节点类型
 */
export type DocNodeType = 'api' | 'component' | 'markdown' | 'custom'

/**
 * 文档节点
 */
export interface DocNode {
  /** 节点类型 */
  type: DocNodeType
  /** 节点名称 */
  name: string
  /** 文件路径 */
  path: string
  /** 输出路径 */
  outputPath?: string
  /** 元数据 */
  metadata: Record<string, any>
  /** 内容 */
  content: any
  /** 子节点 */
  children?: DocNode[]
}

/**
 * API 文档节点
 */
export interface APIDocNode extends DocNode {
  type: 'api'
  content: {
    kind: string
    signatures?: Signature[]
    parameters?: Parameter[]
    returnType?: TypeInfo
    comments?: Comment[]
    examples?: Example[]
    deprecated?: boolean
    since?: string
  }
}

/**
 * 组件文档节点
 */
export interface ComponentDocNode extends DocNode {
  type: 'component'
  content: {
    framework: 'vue' | 'react' | 'angular' | 'svelte' | 'other'
    props: PropInfo[]
    events: EventInfo[]
    slots: SlotInfo[]
    methods?: MethodInfo[]
    examples: Example[]
    description?: string
  }
}

/**
 * Markdown 文档节点
 */
export interface MarkdownDocNode extends DocNode {
  type: 'markdown'
  content: {
    raw: string
    html: string
    frontmatter?: Record<string, any>
    toc?: TOCItem[]
  }
}

/**
 * 签名信息
 */
export interface Signature {
  name: string
  parameters: Parameter[]
  returnType: TypeInfo
  comment?: Comment
}

/**
 * 参数信息
 */
export interface Parameter {
  name: string
  type: TypeInfo
  optional?: boolean
  defaultValue?: any
  description?: string
}

/**
 * 类型信息
 */
export interface TypeInfo {
  name: string
  type: string
  typeArguments?: TypeInfo[]
  raw?: string
}

/**
 * 注释信息
 */
export interface Comment {
  summary?: string
  description?: string
  tags?: CommentTag[]
  examples?: string[]
}

/**
 * 注释标签
 */
export interface CommentTag {
  tag: string
  content: string
}

/**
 * 属性信息
 */
export interface PropInfo {
  name: string
  type: string | TypeInfo
  required: boolean
  defaultValue?: any
  description?: string
  validator?: string
}

/**
 * 事件信息
 */
export interface EventInfo {
  name: string
  description?: string
  parameters?: Parameter[]
}

/**
 * 插槽信息
 */
export interface SlotInfo {
  name: string
  description?: string
  props?: PropInfo[]
}

/**
 * 方法信息
 */
export interface MethodInfo {
  name: string
  signature: Signature
  description?: string
}

/**
 * 示例信息
 */
export interface Example {
  title?: string
  description?: string
  code: string
  language?: string
}

/**
 * TOC 项
 */
export interface TOCItem {
  level: number
  title: string
  slug: string
  children?: TOCItem[]
}

/**
 * 解析上下文
 */
export interface ParseContext {
  /** 源文件列表 */
  files: string[]
  /** 源目录 */
  sourceDir: string
  /** 插件选项 */
  options: any
  /** 日志器 */
  logger: Logger
  /** 缓存目录 */
  cacheDir?: string
}

/**
 * 解析结果
 */
export interface ParseResult {
  /** 文档节点 */
  nodes: DocNode[]
  /** 错误 */
  errors?: Error[]
  /** 警告 */
  warnings?: string[]
}

/**
 * 生成上下文
 */
export interface GenerateContext {
  /** 文档节点 */
  docs: DocNode[]
  /** 输出目录 */
  outputDir: string
  /** 站点配置 */
  siteConfig: SiteConfig
  /** 插件选项 */
  options: any
  /** 日志器 */
  logger: Logger
}

/**
 * 文档插件
 */
export interface DocsPlugin {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 插件作者 */
  author?: string
  /** 插件描述 */
  description?: string
  /** 插件标签 */
  tags?: string[]
  /** 插件依赖 */
  dependencies?: string[]
  /** 插件配置 Schema */
  configSchema?: PluginConfigSchema
  /** 插件配置 */
  config?: any
  /** 解析前钩子 */
  beforeParse?: (context: ParseContext) => Promise<void>
  /** 解析钩子 */
  parse?: (context: ParseContext) => Promise<ParseResult>
  /** 解析后钩子 */
  afterParse?: (result: ParseResult, context: ParseContext) => Promise<ParseResult>
  /** 转换前钩子 */
  beforeTransform?: (docs: DocNode[], context: ParseContext) => Promise<void>
  /** 转换钩子 */
  transform?: (docs: DocNode[], context: ParseContext) => Promise<DocNode[]>
  /** 转换后钩子 */
  afterTransform?: (docs: DocNode[], context: ParseContext) => Promise<DocNode[]>
  /** 生成前钩子 */
  beforeGenerate?: (context: GenerateContext) => Promise<void>
  /** 生成钩子 */
  generate?: (context: GenerateContext) => Promise<void>
  /** 生成后钩子 */
  afterGenerate?: (context: GenerateContext) => Promise<void>
  /** 清理钩子 */
  cleanup?: () => Promise<void>
}

/**
 * 插件配置 Schema
 */
export interface PluginConfigSchema {
  /** Schema 类型 */
  type: 'object'
  /** 属性定义 */
  properties: Record<string, SchemaProperty>
  /** 必填字段 */
  required?: string[]
  /** 默认值 */
  defaults?: Record<string, any>
}

/**
 * Schema 属性
 */
export interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description?: string
  default?: any
  enum?: any[]
  items?: SchemaProperty
  properties?: Record<string, SchemaProperty>
}

/**
 * 文档生成器配置
 */
export interface DocsGeneratorOptions {
  /** 源目录 */
  sourceDir: string
  /** 输出目录 */
  outputDir: string
  /** 插件列表 */
  plugins?: DocsPlugin[]
  /** 站点配置 */
  site?: SiteConfig
  /** 主题配置 */
  theme?: ThemeConfig
  /** 导航配置 */
  navigation?: NavigationConfig
  /** 缓存目录 */
  cacheDir?: string
  /** 日志级别 */
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug'
  /** Vite 配置（开发服务器和构建）*/
  vite?: ViteConfig
  /** Markdown 配置 */
  markdown?: MarkdownConfig
  /** i18n 配置 */
  i18n?: I18nConfig
  /** 构建配置 */
  build?: BuildConfig
  /** PWA 配置 */
  pwa?: PWAConfig
  /** 评论配置 */
  comments?: CommentsConfig
  /** 分析配置 */
  analytics?: AnalyticsConfig
}

/**
 * i18n 配置
 */
export interface I18nConfig {
  /** 默认语言 */
  defaultLocale: string
  /** 所有语言配置 */
  locales: Record<string, LocaleConfig>
  /** 回退语言 */
  fallbackLocale?: string
}

/**
 * 语言配置
 */
export interface LocaleConfig {
  /** 语言代码 */
  lang: string
  /** 语言标签 */
  label: string
  /** 选择器中显示的文本 */
  selectText?: string
  /** 翻译文本 */
  translations?: Record<string, string>
}

/**
 * 构建配置
 */
export interface BuildConfig {
  /** 代码分割配置 */
  codeSplit?: CodeSplitConfig
  /** 图片优化配置 */
  imageOptimization?: ImageOptimizationConfig
  /** 预取配置 */
  prefetch?: PrefetchConfig
  /** Critical CSS 配置 */
  criticalCss?: CriticalCssConfig
}

/**
 * 代码分割配置
 */
export interface CodeSplitConfig {
  enabled?: boolean
  splitVendor?: boolean
  chunkSizeThreshold?: number
  manualChunks?: Record<string, string[]>
}

/**
 * 图片优化配置
 */
export interface ImageOptimizationConfig {
  enabled?: boolean
  convertToWebP?: boolean
  quality?: number
  responsive?: boolean
}

/**
 * 预取配置
 */
export interface PrefetchConfig {
  enabled?: boolean
  preload?: boolean
  prefetchPages?: boolean
  strategy?: 'eager' | 'lazy' | 'viewport'
}

/**
 * Critical CSS 配置
 */
export interface CriticalCssConfig {
  enabled?: boolean
  inline?: boolean
  minify?: boolean
  width?: number
  height?: number
}

/**
 * PWA 配置
 */
export interface PWAConfig {
  enabled?: boolean
  name: string
  shortName?: string
  description?: string
  themeColor?: string
  backgroundColor?: string
}

/**
 * 评论配置
 */
export interface CommentsConfig {
  enabled?: boolean
  provider?: 'giscus' | 'utterances' | 'custom'
  giscus?: GiscusConfig
}

/**
 * Giscus 配置
 */
export interface GiscusConfig {
  repo: string
  repoId: string
  category: string
  categoryId: string
  mapping?: 'pathname' | 'url' | 'title'
  reactionsEnabled?: boolean
  theme?: string
  lang?: string
}

/**
 * 分析配置
 */
export interface AnalyticsConfig {
  enabled?: boolean
  google?: GoogleAnalyticsConfig
  baidu?: BaiduAnalyticsConfig
}

/**
 * Google Analytics 配置
 */
export interface GoogleAnalyticsConfig {
  measurementId: string
  enhancedMeasurement?: boolean
}

/**
 * 百度统计配置
 */
export interface BaiduAnalyticsConfig {
  siteId: string
}

/**
 * 站点配置
 */
export interface SiteConfig {
  /** 站点标题 */
  title: string
  /** 站点描述 */
  description?: string
  /** 站点 Logo */
  logo?: string
  /** 基础路径 */
  base?: string
  /** 语言 */
  lang?: string
  /** 是否启用暗黑模式 */
  darkMode?: boolean
  /** 自定义 Head */
  head?: HeadConfig[]
  /** 社交链接 */
  socialLinks?: SocialLink[]
}

/**
 * Head 配置
 */
export interface HeadConfig {
  tag: string
  attrs?: Record<string, string>
  content?: string
}

/**
 * 社交链接
 */
export interface SocialLink {
  icon: string
  link: string
  title?: string
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string
  /** 模板目录 */
  templateDir?: string
  /** 样式变量 */
  styles?: Record<string, any>
  /** 自定义脚本 */
  scripts?: string[]
}

/**
 * 导航配置
 */
export interface NavigationConfig {
  /** 侧边栏配置 */
  sidebar?: 'auto' | SidebarConfig
  /** 顶部导航 */
  topbar?: NavItem[]
  /** 是否启用面包屑 */
  breadcrumb?: boolean
  /** 是否启用 TOC */
  toc?: boolean
}

/**
 * Markdown 配置
 */
export interface MarkdownConfig {
  /** 是否启用代码行号 */
  lineNumbers?: boolean
  /** 是否启用容器 */
  containers?: boolean
  /** 容器配置 */
  containersConfig?: any
  /** 是否启用 Emoji */
  emoji?: boolean
  /** 是否启用锚点 */
  anchor?: boolean
  /** 代码高亮主题 */
  theme?: 'dark-plus' | 'light-plus' | 'monokai' | 'nord' | 'one-dark-pro'
  /** 自定义 Markdown-it 选项 */
  markdownItOptions?: any
  /** 自定义 Markdown-it 插件 */
  markdownItPlugins?: any[]
}

/**
 * 侧边栏配置
 */
export type SidebarConfig = SidebarItem[] | Record<string, SidebarItem[]>

/**
 * 侧边栏项
 */
export interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

/**
 * 导航项
 */
export interface NavItem {
  text: string
  link?: string
  items?: NavItem[]
  activeMatch?: string
}

/**
 * 导航结构
 */
export interface Navigation {
  sidebar: SidebarItem[]
  topbar: NavItem[]
  breadcrumb: (path: string) => BreadcrumbItem[]
  toc: (doc: DocNode) => TOCItem[]
}

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  text: string
  link?: string
}

/**
 * 主题
 */
export interface Theme {
  name: string
  templates: Record<string, string>
  styles: Record<string, any>
  scripts: Record<string, string>
  assets?: string[]
}

/**
 * 站点选项
 */
export interface SiteOptions {
  outputDir: string
  config: SiteConfig
  theme: Theme
  navigation: NavigationConfig
}

/**
 * 插件管理器选项
 */
export interface PluginManagerOptions {
  logger?: Logger
  cache?: boolean
  timeout?: number
  maxPlugins?: number
}

/**
 * 插件加载结果
 */
export interface PluginLoadResult {
  success: boolean
  plugin?: DocsPlugin
  error?: Error
}

/**
 * 模板数据
 */
export interface TemplateData {
  doc: DocNode
  navigation: Navigation
  site: SiteConfig
  theme: Theme
  [key: string]: any
}

/**
 * 搜索索引项
 */
export interface SearchIndexItem {
  id: string
  title: string
  content: string
  path: string
  excerpt?: string
  tags?: string[]
}

/**
 * 版本信息
 */
export interface VersionInfo {
  version: string
  path: string
  releaseDate?: string
  deprecated?: boolean
}

/**
 * AI 配置
 */
export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'custom'
  apiKey?: string
  apiUrl?: string
  model?: string
  temperature?: number
}

/**
 * AI 响应
 */
export interface AIResponse {
  answer: string
  sources?: string[]
  confidence?: number
}

/**
 * 定义配置函数
 */
export function defineConfig(config: DocsGeneratorOptions): DocsGeneratorOptions {
  return config
}




