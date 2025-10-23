# API 参考文档

## 📚 核心 API

### DocsGenerator

文档生成器主类。

```typescript
class DocsGenerator {
  constructor(options: DocsGeneratorOptions)
  
  /** 生成文档 */
  generate(): Promise<void>
  
  /** 构建生产版本（包含优化）*/
  build(): Promise<void>
  
  /** 清理资源 */
  cleanup(): Promise<void>
}
```

**示例**:
```typescript
import { DocsGenerator } from '@ldesign/docs-generator'

const generator = new DocsGenerator({
  sourceDir: './src',
  outputDir: './docs',
  plugins: [/* ... */],
})

await generator.generate()
```

### PluginManager

插件管理器。

```typescript
class PluginManager {
  constructor(options: PluginManagerOptions)
  
  /** 注册插件 */
  register(plugin: DocsPlugin): PluginLoadResult
  
  /** 注册多个插件 */
  registerAll(plugins: DocsPlugin[]): PluginLoadResult[]
  
  /** 获取插件 */
  getPlugin(name: string): DocsPlugin | undefined
  
  /** 获取所有插件 */
  getAllPlugins(): DocsPlugin[]
  
  /** 获取插件信息 */
  getPluginInfo(): Array<{name, version, author, description}>
  
  /** 启用热重载 */
  enableHotReload(): void
  
  /** 重载插件 */
  reloadPlugin(name: string, newPlugin: DocsPlugin): Promise<boolean>
  
  /** 清空插件 */
  clear(): void
}
```

### ParserSystem

解析系统。

```typescript
class ParserSystem {
  constructor(manager: PluginManager, options: ParserSystemOptions)
  
  /** 解析所有文件 */
  parseAll(): Promise<DocNode[]>
  
  /** 转换文档节点 */
  transform(docs: DocNode[]): Promise<DocNode[]>
}

interface ParserSystemOptions {
  sourceDir: string
  include?: string[]
  exclude?: string[]
  cacheDir?: string
  logger: Logger
  incremental?: boolean
  concurrency?: number
  onProgress?: (progress: ParseProgress) => void
}
```

### TemplateEngine

模板引擎。

```typescript
class TemplateEngine {
  constructor(options: TemplateEngineOptions)
  
  /** 初始化 */
  init(): Promise<void>
  
  /** 渲染模板字符串 */
  render(template: string, data: TemplateData): Promise<string>
  
  /** 渲染模板文件 */
  renderFile(path: string, data: TemplateData, output?: string): Promise<string>
  
  /** 注册辅助函数 */
  registerHelper(name: string, fn: Function): void
  
  /** 注册过滤器 */
  registerFilter(name: string, fn: Function): void
  
  /** 注册片段 */
  registerPartial(name: string, content: string): void
  
  /** 清除缓存 */
  clearCache(): void
  
  /** 获取适配器名称 */
  getAdapterName(): string
}
```

## 🔌 插件 API

### 内置解析器插件

#### typedocPlugin

解析 TypeScript API 文档。

```typescript
function typedocPlugin(options?: {
  tsconfig?: string
  entryPoints?: string[]
  includePrivate?: boolean
}): DocsPlugin
```

#### vueComponentPlugin

解析 Vue 组件。

```typescript
function vueComponentPlugin(options?: {
  include?: string | string[]
  exclude?: string | string[]
}): DocsPlugin
```

#### reactComponentPlugin

解析 React 组件。

```typescript
function reactComponentPlugin(options?: {
  include?: string | string[]
  exclude?: string | string[]
}): DocsPlugin
```

#### markdownPlugin

解析 Markdown 文档。

```typescript
function markdownPlugin(options?: {
  include?: string | string[]
  exclude?: string | string[]
}): DocsPlugin
```

### 增强插件

#### mermaidPlugin

支持 Mermaid 图表。

```typescript
function mermaidPlugin(options?: {
  theme?: 'default' | 'forest' | 'dark' | 'neutral'
  preRender?: boolean
  config?: Record<string, any>
}): DocsPlugin
```

#### katexPlugin

支持数学公式。

```typescript
function katexPlugin(options?: {
  inlineMath?: boolean
  displayMath?: boolean
  delimiters?: {
    inline?: [string, string]
    display?: [string, string]
  }
}): DocsPlugin
```

#### mediaPlugin

媒体优化。

```typescript
function mediaPlugin(options?: {
  lazyLoading?: boolean
  imageOptimization?: boolean
  lightbox?: boolean
  videoAutoplay?: boolean
}): DocsPlugin
```

#### codeDiffPlugin

代码差异对比。

```typescript
function codeDiffPlugin(options?: {
  style?: 'unified' | 'split'
  lineNumbers?: boolean
}): DocsPlugin
```

### 集成插件

#### playgroundPlugin

交互式 Playground。

```typescript
function playgroundPlugin(options?: {
  frameworks?: ('vue' | 'react')[]
  editorTheme?: 'vs-dark' | 'vs-light'
  sandbox?: boolean
}): DocsPlugin
```

#### algoliaPlugin

Algolia 搜索集成。

```typescript
function algoliaPlugin(options: {
  appId: string
  apiKey: string
  indexName: string
  upload?: boolean
}): DocsPlugin
```

#### codesandboxPlugin, stackblitzPlugin, codepenPlugin

代码运行平台集成。

```typescript
function codesandboxPlugin(options?: {
  template?: 'vue' | 'react' | 'vanilla'
  autoOpen?: boolean
}): DocsPlugin

function stackblitzPlugin(options?: {
  template?: 'vue' | 'react' | 'angular' | 'node'
}): DocsPlugin

function codepenPlugin(options?: {
  user?: string
  private?: boolean
}): DocsPlugin
```

## 🛠️ 工具函数

### 文件操作

```typescript
// file-utils
function copyDir(src: string, dest: string): Promise<void>
function ensureDir(dir: string): Promise<void>
function fileExists(file: string): Promise<boolean>
function readJSON<T>(file: string): Promise<T>
function writeJSON(file: string, data: any): Promise<void>
function getFileSize(file: string): Promise<number>
```

### Markdown 处理

```typescript
// markdown-utils
function extractFrontmatter(markdown: string): { data: any; content: string }
function generateSlug(text: string): string
function extractHeadings(markdown: string): TOCItem[]
function countWords(text: string): number
function estimateReadingTime(text: string): number
```

### 路径处理

```typescript
// path-utils
function normalizePath(p: string): string
function getRelativePath(from: string, to: string): string
function resolveOutputPath(inputPath: string, outputDir: string): string
function joinUrlPath(...paths: string[]): string
```

## 📝 类型定义

### DocNode

```typescript
interface DocNode {
  type: 'api' | 'component' | 'markdown' | 'custom'
  name: string
  path: string
  outputPath?: string
  metadata: Record<string, any>
  content: any
  children?: DocNode[]
}
```

### DocsPlugin

```typescript
interface DocsPlugin {
  name: string
  version: string
  author?: string
  description?: string
  tags?: string[]
  dependencies?: string[]
  configSchema?: PluginConfigSchema
  config?: any
  
  // 生命周期钩子
  beforeParse?: (context: ParseContext) => Promise<void>
  parse?: (context: ParseContext) => Promise<ParseResult>
  afterParse?: (result: ParseResult, context: ParseContext) => Promise<ParseResult>
  beforeTransform?: (docs: DocNode[], context: ParseContext) => Promise<void>
  transform?: (docs: DocNode[], context: ParseContext) => Promise<DocNode[]>
  afterTransform?: (docs: DocNode[], context: ParseContext) => Promise<DocNode[]>
  beforeGenerate?: (context: GenerateContext) => Promise<void>
  generate?: (context: GenerateContext) => Promise<void>
  afterGenerate?: (context: GenerateContext) => Promise<void>
  cleanup?: () => Promise<void>
}
```

### DocsGeneratorOptions

```typescript
interface DocsGeneratorOptions {
  sourceDir: string
  outputDir: string
  plugins?: DocsPlugin[]
  site?: SiteConfig
  theme?: ThemeConfig
  navigation?: NavigationConfig
  cacheDir?: string
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug'
}
```

---

**完整的 TypeScript 类型定义请查看源码或生成的 TypeDoc 文档。**


