# 插件开发指南

## 📖 概述

@ldesign/docs-generator 采用插件化架构，所有的文档解析、转换和生成功能都通过插件实现。本指南将帮助你开发自定义插件。

## 🎯 插件类型

根据功能，插件主要分为以下几类：

1. **解析器插件** - 解析特定类型的文件（如 TypeScript、Vue、React）
2. **转换器插件** - 转换和增强文档节点（如添加 TOC、处理图表）
3. **生成器插件** - 生成额外的输出（如搜索索引、站点地图）
4. **集成插件** - 与第三方服务集成（如 Algolia、Analytics）

## 🏗️ 插件结构

### 基础插件接口

```typescript
import type { DocsPlugin } from '@ldesign/docs-generator'

export interface DocsPlugin {
  // 必填字段
  name: string                    // 插件名称（唯一标识）
  version: string                 // 插件版本

  // 元数据（可选）
  author?: string                 // 作者
  description?: string            // 描述
  tags?: string[]                 // 标签
  dependencies?: string[]         // 依赖的其他插件

  // 配置（可选）
  configSchema?: PluginConfigSchema  // 配置 Schema
  config?: any                    // 插件配置

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

## 📝 开发步骤

### 1. 创建插件文件

```typescript
// src/plugins/my-plugin.ts
import type { DocsPlugin, ParseContext, ParseResult } from '@ldesign/docs-generator'

export interface MyPluginOptions {
  // 插件选项
  include?: string[]
  exclude?: string[]
}

export function myPlugin(options: MyPluginOptions = {}): DocsPlugin {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    author: 'Your Name',
    description: '我的自定义插件',
    
    async parse(context: ParseContext): Promise<ParseResult> {
      const { files, sourceDir, logger } = context
      const nodes = []
      
      // 实现解析逻辑
      for (const file of files) {
        // 解析文件...
      }
      
      return { nodes }
    }
  }
}
```

### 2. 注册配置 Schema（可选）

```typescript
export function myPlugin(options: MyPluginOptions = {}): DocsPlugin {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    
    // 定义配置 Schema
    configSchema: {
      type: 'object',
      properties: {
        include: {
          type: 'array',
          description: '包含的文件模式',
          default: ['**/*.custom'],
        },
        exclude: {
          type: 'array',
          description: '排除的文件模式',
        },
      },
      required: ['include'],
    },
    
    // 插件配置
    config: options,
    
    // ...
  }
}
```

### 3. 实现生命周期钩子

#### Parse 钩子（解析）

```typescript
async parse(context: ParseContext): Promise<ParseResult> {
  const { files, sourceDir, logger } = context
  const nodes: DocNode[] = []
  
  for (const file of files) {
    // 过滤文件
    if (!shouldProcess(file)) {
      continue
    }
    
    // 读取文件
    const content = await fs.readFile(file, 'utf-8')
    
    // 解析文件
    const parsed = parseCustomFile(content)
    
    // 创建文档节点
    nodes.push({
      type: 'custom',
      name: path.basename(file, '.custom'),
      path: file,
      metadata: parsed.metadata,
      content: parsed.content,
    })
  }
  
  return { nodes }
}
```

#### Transform 钩子（转换）

```typescript
async transform(docs: DocNode[], context: ParseContext): Promise<DocNode[]> {
  const { logger } = context
  
  for (const doc of docs) {
    // 只处理特定类型的文档
    if (doc.type !== 'custom') {
      continue
    }
    
    // 转换文档内容
    doc.content.enhanced = enhanceContent(doc.content.raw)
    
    // 添加元数据
    doc.metadata.processed = true
    doc.metadata.processedAt = new Date().toISOString()
  }
  
  return docs
}
```

#### Generate 钩子（生成）

```typescript
async generate(context: GenerateContext): Promise<void> {
  const { docs, outputDir, logger } = context
  
  // 过滤需要处理的文档
  const customDocs = docs.filter(doc => doc.type === 'custom')
  
  // 生成额外的输出文件
  for (const doc of customDocs) {
    const outputPath = path.join(outputDir, 'custom', `${doc.name}.json`)
    await fs.ensureDir(path.dirname(outputPath))
    await fs.writeJSON(outputPath, doc.content, { spaces: 2 })
  }
  
  logger.info(`生成了 ${customDocs.length} 个自定义文件`)
}
```

### 4. 使用插件

```typescript
// docs-generator.config.ts
import { defineConfig } from '@ldesign/docs-generator'
import { myPlugin } from './plugins/my-plugin'

export default defineConfig({
  sourceDir: './src',
  outputDir: './docs',
  
  plugins: [
    myPlugin({
      include: ['**/*.custom'],
      exclude: ['**/node_modules/**'],
    }),
  ],
})
```

## 🔧 高级功能

### 插件依赖

如果你的插件依赖其他插件，可以声明依赖关系：

```typescript
export function advancedPlugin(): DocsPlugin {
  return {
    name: 'advanced-plugin',
    version: '1.0.0',
    
    // 声明依赖
    dependencies: ['base-plugin', 'utility-plugin'],
    
    // 依赖的插件会在此插件之前执行
    transform: async (docs, context) => {
      // base-plugin 和 utility-plugin 已经处理过文档
      // 可以使用它们添加的元数据
      return docs
    },
  }
}
```

**注意**：
- 插件会按依赖顺序自动排序
- 循环依赖会被检测并报错
- 缺失的依赖会产生警告

### 使用 before/after 钩子

```typescript
export function enhancedPlugin(): DocsPlugin {
  return {
    name: 'enhanced-plugin',
    version: '1.0.0',
    
    // 在解析前准备环境
    beforeParse: async (context) => {
      context.logger.info('准备解析环境...')
      // 初始化资源
    },
    
    // 主解析逻辑
    parse: async (context) => {
      return { nodes: [] }
    },
    
    // 解析后处理结果
    afterParse: async (result, context) => {
      context.logger.info(`解析完成，共 ${result.nodes.length} 个节点`)
      // 后处理
      return result
    },
  }
}
```

### 错误处理

```typescript
import { ParseError, PluginError } from '@ldesign/docs-generator'

export function robustPlugin(): DocsPlugin {
  return {
    name: 'robust-plugin',
    version: '1.0.0',
    
    parse: async (context) => {
      const nodes = []
      const errors = []
      
      for (const file of context.files) {
        try {
          // 解析文件
          const node = await parseFile(file)
          nodes.push(node)
        } catch (error) {
          // 收集错误而不是中断
          errors.push(new ParseError(
            `解析文件失败: ${file}`,
            { cause: error }
          ))
          context.logger.error(`跳过文件 ${file}:`, error)
        }
      }
      
      return { nodes, errors }
    },
  }
}
```

### 缓存支持

```typescript
import { CacheManager } from '@ldesign/docs-generator'

export function cachedPlugin(): DocsPlugin {
  let cache: CacheManager
  
  return {
    name: 'cached-plugin',
    version: '1.0.0',
    
    beforeParse: async (context) => {
      cache = new CacheManager({
        cacheDir: context.cacheDir || '.cache',
        namespace: 'my-plugin',
      })
    },
    
    parse: async (context) => {
      const nodes = []
      
      for (const file of context.files) {
        // 尝试从缓存获取
        const cached = await cache.get(file, async () => {
          // 缓存未命中，执行解析
          return await parseFile(file)
        })
        
        nodes.push(cached)
      }
      
      return { nodes }
    },
    
    cleanup: async () => {
      // 清理缓存
      await cache.clear()
    },
  }
}
```

## 📚 常见场景

### 场景 1: 自定义文件格式解析

```typescript
export function jsonSchemaPlugin(): DocsPlugin {
  return {
    name: 'json-schema',
    version: '1.0.0',
    
    parse: async (context) => {
      const nodes = []
      
      // 只处理 .schema.json 文件
      const schemaFiles = context.files.filter(f => f.endsWith('.schema.json'))
      
      for (const file of schemaFiles) {
        const schema = await fs.readJSON(file)
        
        nodes.push({
          type: 'custom',
          name: schema.title || path.basename(file, '.schema.json'),
          path: file,
          metadata: {
            schemaType: schema.type,
            required: schema.required || [],
          },
          content: schema,
        })
      }
      
      return { nodes }
    },
  }
}
```

### 场景 2: 内容增强

```typescript
export function syntaxHighlightPlugin(): DocsPlugin {
  return {
    name: 'syntax-highlight',
    version: '1.0.0',
    
    transform: async (docs, context) => {
      for (const doc of docs) {
        if (doc.type === 'markdown' && doc.content.html) {
          // 增强代码块的语法高亮
          doc.content.html = await highlightCode(doc.content.html)
        }
      }
      
      return docs
    },
  }
}
```

### 场景 3: 生成额外文件

```typescript
export function sitemapPlugin(): DocsPlugin {
  return {
    name: 'sitemap',
    version: '1.0.0',
    
    generate: async (context) => {
      const { docs, outputDir, siteConfig } = context
      
      // 生成 sitemap.xml
      const urls = docs.map(doc => ({
        loc: `${siteConfig.base || ''}${doc.outputPath}`,
        lastmod: new Date().toISOString(),
      }))
      
      const xml = generateSitemapXML(urls)
      
      const sitemapPath = path.join(outputDir, 'sitemap.xml')
      await fs.writeFile(sitemapPath, xml, 'utf-8')
      
      context.logger.info(`Sitemap 已生成: ${sitemapPath}`)
    },
  }
}
```

## 🧪 测试插件

### 单元测试

```typescript
// __tests__/plugins/my-plugin.test.ts
import { describe, it, expect } from 'vitest'
import { myPlugin } from '../src/plugins/my-plugin'

describe('MyPlugin', () => {
  it('应该解析自定义文件', async () => {
    const plugin = myPlugin()
    
    const result = await plugin.parse!({
      files: ['/test/file.custom'],
      sourceDir: '/test',
      options: {},
      logger: mockLogger,
    })
    
    expect(result.nodes).toHaveLength(1)
  })
})
```

## 💡 最佳实践

### 1. 命名规范
- 插件名称使用 kebab-case：`my-custom-plugin`
- 插件函数使用 camelCase：`myCustomPlugin()`
- 导出类型使用 PascalCase：`MyPluginOptions`

### 2. 错误处理
- 捕获并记录错误，不要让单个文件的错误中断整个流程
- 使用 `ParseError`、`PluginError` 等自定义错误类
- 在 `ParseResult` 中返回 errors 和 warnings

### 3. 性能优化
- 使用缓存避免重复计算
- 支持增量解析
- 大量文件时使用并行处理

### 4. 日志记录
- 使用 context.logger 记录日志
- debug: 详细的调试信息
- info: 重要的进度信息
- warn: 警告但可继续
- error: 错误信息

### 5. 配置验证
- 提供 configSchema 进行配置验证
- 设置合理的默认值
- 提供友好的错误提示

## 📦 发布插件

### 1. 创建 NPM 包

```bash
mkdir my-docs-plugin
cd my-docs-plugin
npm init -y
```

### 2. package.json 配置

```json
{
  "name": "@myorg/docs-generator-my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin for @ldesign/docs-generator",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": [
    "ldesign",
    "docs-generator",
    "plugin"
  ],
  "peerDependencies": {
    "@ldesign/docs-generator": "^2.0.0"
  }
}
```

### 3. 导出插件

```typescript
// src/index.ts
export { myPlugin, type MyPluginOptions } from './my-plugin'
```

### 4. 发布

```bash
npm publish --access public
```

## 🔍 调试技巧

### 1. 启用调试日志

```typescript
import { DocsGenerator } from '@ldesign/docs-generator'

const generator = new DocsGenerator({
  // ...
  logLevel: 'debug', // 启用调试日志
})
```

### 2. 使用插件信息API

```typescript
import { PluginManager } from '@ldesign/docs-generator'

const pluginManager = new PluginManager({ logger })
// 注册插件...

// 获取插件信息
const info = pluginManager.getPluginInfo()
console.log('已注册的插件:', info)
```

### 3. 热重载测试

```typescript
pluginManager.enableHotReload()

// 修改插件后重载
await pluginManager.reloadPlugin('my-plugin', newPluginInstance)
```

## 📖 示例插件

查看以下内置插件的源码作为参考：

- `src/plugins/parsers/typedoc-plugin.ts` - TypeScript 解析
- `src/plugins/parsers/vue-component-plugin.ts` - Vue 组件解析
- `src/plugins/enhancements/MermaidPlugin.ts` - Mermaid 图表
- `src/plugins/integrations/AlgoliaPlugin.ts` - Algolia 集成

## 🤝 贡献插件

如果你开发了有用的插件，欢迎：

1. 提交 Pull Request 将插件添加到内置插件
2. 在社区分享你的插件
3. 添加到插件市场（计划中）

## 📧 联系方式

- GitHub Issues: https://github.com/ldesign/ldesign/issues
- 插件讨论: https://github.com/ldesign/ldesign/discussions

---

**祝你开发愉快！** 🚀



