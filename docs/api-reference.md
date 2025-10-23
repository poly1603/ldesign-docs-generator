# API 参考

## 核心 API

### DocsGenerator

文档生成器主类。

```typescript
import { DocsGenerator } from '@ldesign/docs-generator'

const generator = new DocsGenerator(options)
await generator.generate()
```

#### 构造函数

```typescript
constructor(options: DocsGeneratorOptions)
```

#### 方法

##### generate()

生成文档。

```typescript
async generate(): Promise<void>
```

##### build()

构建生产版本。

```typescript
async build(): Promise<void>
```

##### cleanup()

清理资源。

```typescript
async cleanup(): Promise<void>
```

---

### defineConfig

定义配置的辅助函数，提供类型提示。

```typescript
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  // 完整的类型提示
})
```

---

## Vite 集成 API

### createDevServer

创建 Vite 开发服务器。

```typescript
import { createDevServer } from '@ldesign/docs-generator'

const server = await createDevServer({
  sourceDir: './docs',
  outputDir: './dist',
  port: 5173,
  logger,
})
```

### startDevServer

创建并启动开发服务器。

```typescript
import { startDevServer } from '@ldesign/docs-generator'

const server = await startDevServer(options)
```

### stopDevServer

停止开发服务器。

```typescript
import { stopDevServer } from '@ldesign/docs-generator'

await stopDevServer(server)
```

---

## Markdown API

### applyMarkdownEnhancements

应用所有 Markdown 增强功能。

```typescript
import MarkdownIt from 'markdown-it'
import { applyMarkdownEnhancements } from '@ldesign/docs-generator'

const md = new MarkdownIt()
applyMarkdownEnhancements(md, markdownConfig, sourceDir)
```

### 单独的增强功能

```typescript
import {
  applyContainers,
  applyLineNumbers,
  applyHighlightLines,
  applyCodeGroups,
  applyEmoji,
  applyAnchor,
  applyImportCode,
  applyExternalLinks,
} from '@ldesign/docs-generator'
```

---

## 插件 API

### 解析器插件

```typescript
import { DocsPlugin } from '@ldesign/docs-generator'

const myPlugin: DocsPlugin = {
  name: 'my-parser',
  version: '1.0.0',
  
  async parse(context) {
    // 解析文件
    return { nodes: [...] }
  },
}
```

### 转换器插件

```typescript
const myPlugin: DocsPlugin = {
  name: 'my-transformer',
  
  async transform(context) {
    // 转换节点
    return { nodes: context.nodes }
  },
}
```

### 生成器插件

```typescript
const myPlugin: DocsPlugin = {
  name: 'my-generator',
  
  async generate(context) {
    // 生成文件
  },
}
```

---

## 主题 API

### ThemeResolver

解析主题配置。

```typescript
import { ThemeResolver } from '@ldesign/docs-generator'

const resolver = new ThemeResolver(config, logger)
const theme = await resolver.resolveTheme()
```

### ThemeBuilder

构建主题。

```typescript
import { ThemeBuilder } from '@ldesign/docs-generator'

const builder = new ThemeBuilder(themeDir, logger)
await builder.build(outputDir)
```

---

## i18n API

### I18nManager

国际化管理器。

```typescript
import { createI18nManager } from '@ldesign/docs-generator'

const i18n = createI18nManager(config, logger)

// 翻译文本
const text = i18n.t('key')

// 切换语言
i18n.setCurrentLocale('en-US')
```

### LanguageRouter

语言路由器。

```typescript
import { createLanguageRouter } from '@ldesign/docs-generator'

const router = createLanguageRouter(config)

// 获取语言化路径
const path = router.localePath('/guide', 'en-US')
```

---

## 构建优化 API

### CodeSplitter

代码分割器。

```typescript
import { createCodeSplitter } from '@ldesign/docs-generator'

const splitter = createCodeSplitter(config, logger)
const viteConfig = splitter.getViteBuildConfig()
```

### ImageOptimizer

图片优化器。

```typescript
import { createImageOptimizer } from '@ldesign/docs-generator'

const optimizer = createImageOptimizer(config, logger)
await optimizer.optimizeImages(imageDir, outputDir)
```

### PrefetchGenerator

预取生成器。

```typescript
import { createPrefetchGenerator } from '@ldesign/docs-generator'

const generator = createPrefetchGenerator(config, logger)
const links = generator.generatePrefetchLinks(pages)
```

---

## 高级功能 API

### ManifestGenerator

PWA Manifest 生成器。

```typescript
import { createManifestGenerator } from '@ldesign/docs-generator'

const generator = createManifestGenerator(config, logger)
await generator.generateManifest(outputDir)
await generator.generateServiceWorker(outputDir)
```

### GiscusIntegration

Giscus 评论集成。

```typescript
import { createGiscusIntegration } from '@ldesign/docs-generator'

const giscus = createGiscusIntegration(config, logger)
const script = giscus.generateScript()
const component = giscus.generateVueComponent()
```

### AnalyticsManager

分析管理器。

```typescript
import { createAnalyticsManager } from '@ldesign/docs-generator'

const analytics = createAnalyticsManager(config, logger)
const scripts = analytics.generateAllScripts()
```

---

## 工具函数 API

### 文件工具

```typescript
import { ensureDir, readFile, writeFile, copyDir } from '@ldesign/docs-generator'

await ensureDir(dir)
const content = await readFile(path)
await writeFile(path, content)
await copyDir(source, target)
```

### Markdown 工具

```typescript
import { parseFrontmatter, generateTOC, slugify } from '@ldesign/docs-generator'

const { data, content } = parseFrontmatter(markdown)
const toc = generateTOC(markdown)
const slug = slugify('My Title')
```

### 路径工具

```typescript
import { normalizePath, resolveAlias } from '@ldesign/docs-generator'

const normalized = normalizePath(path)
const resolved = resolveAlias(path, aliases)
```

---

## 类型定义

### 主要类型

```typescript
import type {
  DocsGeneratorOptions,
  DocNode,
  SiteConfig,
  ThemeConfig,
  NavigationConfig,
  MarkdownConfig,
  I18nConfig,
  PWAConfig,
} from '@ldesign/docs-generator'
```

### 插件类型

```typescript
import type {
  DocsPlugin,
  ParseContext,
  TransformContext,
  GenerateContext,
  ParseResult,
} from '@ldesign/docs-generator'
```

### 节点类型

```typescript
import type {
  APIDocNode,
  ComponentDocNode,
  MarkdownDocNode,
  PropInfo,
  EventInfo,
  SlotInfo,
} from '@ldesign/docs-generator'
```

---

## 钩子和生命周期

### 插件生命周期

```typescript
const plugin: DocsPlugin = {
  // 解析阶段
  beforeParse: async (context) => {},
  parse: async (context) => {},
  afterParse: async (context) => {},

  // 转换阶段
  beforeTransform: async (context) => {},
  transform: async (context) => {},
  afterTransform: async (context) => {},

  // 生成阶段
  beforeGenerate: async (context) => {},
  generate: async (context) => {},
  afterGenerate: async (context) => {},

  // 清理阶段
  cleanup: async () => {},
}
```

### 构建钩子

```typescript
export default defineConfig({
  hooks: {
    beforeBuild: async () => {
      // 构建前
    },
    afterBuild: async () => {
      // 构建后
    },
    onError: async (error) => {
      // 错误处理
    },
  },
})
```

---

## 配置助手

### defineConfig

```typescript
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  // 类型安全的配置
})
```

### mergeConfig

```typescript
import { mergeConfig } from '@ldesign/docs-generator'

const merged = mergeConfig(baseConfig, userConfig)
```

---

## CLI API

### 编程式使用

```typescript
import { DocsGenerator } from '@ldesign/docs-generator'

// 创建生成器
const generator = new DocsGenerator({
  sourceDir: './docs',
  outputDir: './dist',
})

// 生成文档
await generator.generate()

// 构建
await generator.build()
```

---

## 事件系统

### 监听事件

```typescript
generator.on('start', () => {
  console.log('开始生成')
})

generator.on('progress', (progress) => {
  console.log(`进度: ${progress.percentage}%`)
})

generator.on('complete', () => {
  console.log('生成完成')
})

generator.on('error', (error) => {
  console.error('生成失败', error)
})
```

---

## 相关链接

- [配置参考](./configuration.md)
- [插件开发](./plugin-development.md)
- [主题开发](./theme-development.md)
- [TypeScript 类型](https://github.com/ldesign/ldesign/tree/main/tools/docs-generator/src/types)

