# 架构设计文档

## 📐 整体架构

@ldesign/docs-generator 采用插件化、模块化的架构设计，核心理念是"一切皆插件"。

```
┌─────────────────────────────────────────────────────────┐
│              @ldesign/docs-generator                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐   ┌────────────┐ │
│  │ DocsGenerator│───▶│PluginManager │──▶│  Plugins   │ │
│  │              │    │              │   │            │ │
│  │ - generate() │    │ - register() │   │ - parse()  │ │
│  │ - build()    │    │ - execute()  │   │ - transform│ │
│  │ - cleanup()  │    │ - hotReload()│   │ - generate │ │
│  └──────────────┘    └──────────────┘   └────────────┘ │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐    ┌──────────────┐   ┌────────────┐ │
│  │ ParserSystem │───▶│Incremental   │──▶│ParserWorker│ │
│  │              │    │Parser        │   │Pool        │ │
│  │ - parseAll() │    │              │   │            │ │
│  │ - transform()│    │ - detect()   │   │ - parallel │ │
│  └──────────────┘    └──────────────┘   └────────────┘ │
│         │                                                │
│         ▼                                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Site Generation Layer                  │  │
│  ├────────────┬────────────┬──────────────┬─────────┤  │
│  │StaticSite  │Template    │Theme         │Navigation│  │
│  │Engine      │Engine      │Manager       │Builder   │  │
│  └────────────┴────────────┴──────────────┴─────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🧩 核心模块

### 1. DocsGenerator（主生成器）

**职责**:
- 协调整个文档生成流程
- 管理配置
- 初始化各个子系统

**关键方法**:
- `generate()`: 生成文档
- `build()`: 构建生产版本
- `cleanup()`: 清理资源

**流程**:
```
初始化 → 解析文件 → 转换节点 → 生成站点 → 清理
```

### 2. PluginManager（插件管理器）

**职责**:
- 注册和管理插件
- 解析插件依赖关系
- 执行插件生命周期钩子
- 插件配置验证
- 支持插件热重载

**关键特性**:
- **依赖解析**: 使用拓扑排序确保插件按正确顺序执行
- **循环依赖检测**: 自动检测并报告循环依赖
- **配置验证**: 基于 JSON Schema 验证插件配置
- **错误隔离**: 单个插件错误不影响其他插件

**生命周期钩子顺序**:
```
beforeParse → parse → afterParse
    ↓
beforeTransform → transform → afterTransform
    ↓
beforeGenerate → generate → afterGenerate
    ↓
cleanup
```

### 3. ParserSystem（解析系统）

**职责**:
- 扫描源文件
- 协调插件解析
- 管理解析缓存
- 报告解析进度

**关键特性**:
- **增量解析**: 只解析变化的文件
- **文件变化检测**: 基于 MD5 哈希
- **并行处理**: 支持多进程解析
- **进度报告**: 实时进度回调

**性能优化**:
- 文件级缓存
- 并行解析（默认 4 并发）
- 智能缓存失效

### 4. TemplateEngine（模板引擎）

**职责**:
- 管理模板适配器
- 渲染模板
- 注册辅助函数和过滤器

**支持的引擎**:
- EJS（默认）
- Handlebars（可选）
- Nunjucks（可选）
- 自定义适配器

**适配器模式**:
```typescript
interface ITemplateAdapter {
  render(template: string, data: any): Promise<string>
  renderFile(filePath: string, data: any): Promise<string>
  registerHelper(name: string, fn: Function): void
  registerFilter(name: string, fn: Function): void
}
```

## 🔌 插件系统

### 插件类型

#### 1. 解析器插件

解析特定类型的文件，生成 DocNode。

```typescript
{
  name: 'typescript-parser',
  parse: async (context) => {
    // 解析 .ts 文件
    return { nodes: [...] }
  }
}
```

**示例**: TypeDocPlugin, VueComponentPlugin

#### 2. 转换器插件

转换和增强文档节点。

```typescript
{
  name: 'mermaid-transformer',
  transform: async (docs, context) => {
    // 处理 Mermaid 图表
    return docs
  }
}
```

**示例**: MermaidPlugin, KatexPlugin

#### 3. 生成器插件

生成额外的输出文件。

```typescript
{
  name: 'search-generator',
  generate: async (context) => {
    // 生成搜索索引
  }
}
```

**示例**: AlgoliaPlugin

### 插件依赖

插件可以声明依赖关系，系统会自动排序：

```typescript
{
  name: 'enhanced-plugin',
  dependencies: ['base-plugin'],
  
  transform: async (docs) => {
    // base-plugin 已经执行
    // 可以使用它添加的元数据
  }
}
```

**依赖解析算法**: Kahn's 拓扑排序

## 📊 数据流

### 文档生成流程

```
源文件
  │
  ▼
┌─────────────┐
│ 文件扫描     │ glob 匹配
└─────────────┘
  │
  ▼
┌─────────────┐
│ 增量检测     │ IncrementalParser
└─────────────┘
  │
  ▼
┌─────────────┐
│ 插件解析     │ parse 钩子
└─────────────┘
  │
  ▼
┌─────────────┐
│ 文档节点     │ DocNode[]
└─────────────┘
  │
  ▼
┌─────────────┐
│ 插件转换     │ transform 钩子
└─────────────┘
  │
  ▼
┌─────────────┐
│ 站点生成     │ StaticSiteEngine
└─────────────┘
  │
  ▼
┌─────────────┐
│ 模板渲染     │ TemplateEngine
└─────────────┘
  │
  ▼
┌─────────────┐
│ 插件生成     │ generate 钩子
└─────────────┘
  │
  ▼
HTML 文档
```

### 文档节点（DocNode）

文档节点是核心数据结构：

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

**不同类型的内容结构**:

- **API**: `{ kind, signatures, parameters, returnType, comments, examples }`
- **Component**: `{ framework, props, events, slots, methods, examples }`
- **Markdown**: `{ raw, html, frontmatter, toc }`

## 🎯 设计模式

### 1. 插件模式（Plugin Pattern）

所有功能都通过插件实现，核心只提供基础框架。

**优点**:
- 高度可扩展
- 松耦合
- 易于测试
- 按需加载

### 2. 适配器模式（Adapter Pattern）

模板引擎使用适配器模式支持多种引擎。

```typescript
ITemplateAdapter
  ├── EjsAdapter
  ├── HandlebarsAdapter
  └── NunjucksAdapter
```

### 3. 策略模式（Strategy Pattern）

不同的解析策略通过插件实现。

### 4. 观察者模式（Observer Pattern）

进度报告使用回调函数。

```typescript
onProgress: (progress) => {
  console.log(`${progress.percentage}%`)
}
```

## ⚡ 性能优化

### 1. 缓存策略

**三级缓存**:
1. 内存缓存（TemplateEngine）
2. 文件级缓存（IncrementalParser）
3. 磁盘缓存（CacheManager）

### 2. 并行处理

```typescript
// 并行解析
SimpleParallelParser (并发度: 4)

// 并行转换
processInParallel(tasks, concurrency: 4)
```

### 3. 增量构建

只解析变化的文件：
- 基于 MD5 哈希检测变化
- 缓存解析结果
- 5-10倍性能提升

## 🛡️ 错误处理

### 错误层次结构

```
DocsGeneratorError（基类）
  ├── PluginError
  ├── ParseError
  ├── ConfigError
  ├── TemplateError
  ├── FileSystemError
  └── ValidationError
```

### 错误处理策略

1. **优雅降级**: 单个文件错误不中断流程
2. **错误收集**: 收集所有错误统一报告
3. **友好提示**: 提供解决建议
4. **日志分级**: debug/info/warn/error

## 📁 目录结构

```
src/
├── core/                  # 核心模块
│   ├── DocsGenerator.ts   # 主生成器
│   ├── PluginManager.ts   # 插件管理器
│   ├── ParserSystem.ts    # 解析系统
│   ├── Logger.ts          # 日志系统
│   ├── CacheManager.ts    # 缓存管理器
│   ├── ConfigValidator.ts # 配置验证器
│   └── errors.ts          # 错误类
├── plugins/               # 插件
│   ├── parsers/           # 解析器插件
│   ├── enhancements/      # 增强插件
│   ├── integrations/      # 集成插件
│   └── PluginDependencyResolver.ts
├── parsers/               # 解析器
│   ├── IncrementalParser.ts
│   └── ParserWorker.ts
├── generators/            # 生成器
│   ├── StaticSiteEngine.ts
│   ├── TemplateEngine.ts
│   ├── ThemeManager.ts
│   ├── NavigationBuilder.ts
│   └── template-adapters/
├── features/              # 功能模块
│   ├── search/
│   └── versioning/
├── utils/                 # 工具函数
├── types/                 # 类型定义
└── cli/                   # CLI 工具
```

## 🔄 扩展点

### 1. 自定义插件

任何人都可以创建插件扩展功能。

### 2. 自定义模板引擎

实现 `ITemplateAdapter` 接口支持新的模板引擎。

### 3. 自定义主题

创建新的模板和样式。

### 4. 自定义工具函数

添加新的辅助函数和过滤器。

## 🎓 设计原则

1. **单一职责**: 每个模块只做一件事
2. **开放封闭**: 对扩展开放，对修改封闭
3. **依赖倒置**: 依赖抽象而非具体实现
4. **接口隔离**: 小而精的接口
5. **最小惊讶**: API 设计符合直觉

## 📊 性能指标

### 典型项目性能

| 项目规模 | 文件数 | 首次解析 | 增量解析 | 内存占用 |
|---------|--------|---------|---------|---------|
| 小型 | <100 | ~2s | ~0.5s | ~50MB |
| 中型 | 100-500 | ~8s | ~1.5s | ~150MB |
| 大型 | 500-1000 | ~20s | ~3s | ~300MB |
| 超大型 | >1000 | ~45s | ~8s | ~500MB |

### 优化建议

- 启用增量解析（默认开启）
- 调整并发度（默认 4）
- 使用缓存（默认开启）
- 排除不必要的文件

## 🔮 未来规划

### v2.1.0
- Playground 系统
- 主题市场
- 更多内置主题

### v2.2.0
- AI 文档助手
- 实时协作
- 云端构建

### v3.0.0
- 完全重写的插件系统
- 更强大的性能优化
- 企业级功能

---

**文档版本**: 2.0  
**更新时间**: 2025-10-23



