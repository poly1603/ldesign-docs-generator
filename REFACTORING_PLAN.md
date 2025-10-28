# 📋 渐进式重构计划：实现 VitePress 功能 + 保留现有能力

## 🎯 核心策略：双模式架构

### 架构设计原则

```
┌─────────────────────────────────────────────────────────────┐
│                    统一的解析层                                │
│  Parser System (TypeDoc/Vue/React/Markdown)                 │
│  ✅ 保留所有现有插件和解析能力                                 │
└──────────────┬──────────────────────────────────────────────┘
               │
               ├────────────────────┬────────────────────────┐
               │                    │                        │
      ┌────────▼────────┐  ┌────────▼────────┐    ┌────────▼────────┐
      │  Dev Mode       │  │  Build Mode     │    │  Generate Mode  │
      │  (新增 SPA)     │  │  (混合 SSR+SPA) │    │  (保留 SSG)     │
      └─────────────────┘  └─────────────────┘    └─────────────────┘
              │                     │                       │
      VitePress 体验         最优性能输出            兼容旧版流程
```

---

## 📦 第一阶段：基础设施（2周）- 无破坏性

### ✅ 已完成
- [x] `src/types/modes.ts` - 运行模式类型定义
- [x] `src/app/index.ts` - Vue SPA 应用入口
- [x] `src/app/router.ts` - 自动路由生成系统
- [x] `src/app/store.ts` - 全局状态管理

### 🔨 待完成

#### 1.1 全局组件注册系统
**文件**: `src/app/components.ts`
```typescript
// 注册所有 VitePress 主题组件
export function setupGlobalComponents(app: App) {
  // 从 templates/vitepress-default/components 自动注册
  // 使所有组件在路由页面中可用
}
```

#### 1.2 应用入口 HTML 模板
**文件**: `templates/index.html`
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }}</title>
  <!-- 注入站点配置 -->
  <script>
    window.__DOCS_CONFIG__ = {{ config }}
  </script>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/app/index.ts"></script>
</body>
</html>
```

#### 1.3 文档模板组件
**文件**: `src/templates/`
```
src/templates/
├── api-doc.vue        # API 文档展示组件
├── component-doc.vue  # 组件文档展示组件
├── custom-doc.vue     # 自定义文档组件
└── 404.vue           # 404 页面
```

#### 1.4 路由数据生成器
**文件**: `src/app/route-data-generator.ts`
```typescript
/**
 * 在构建时生成路由数据
 * 将 ParserSystem 解析的 DocNode[] 转换为路由配置
 */
export async function generateRouteData(docs: DocNode[]): Promise<RouteData> {
  // 生成路由映射
  // 生成搜索索引
  // 生成导航配置
}
```

---

## 🚀 第二阶段：Dev 模式重构（2周）

### 2.1 重写 `dev` 命令
**文件**: `src/cli/commands/dev.ts`

**旧流程** ❌:
```typescript
// 1. 先运行 ParserSystem 解析所有文件
// 2. 生成静态 HTML
// 3. 启动 Vite 服务器展示 HTML
```

**新流程** ✅:
```typescript
export async function devCommand(options) {
  // 1. 运行 ParserSystem 解析文件 (保留)
  const docs = await parserSystem.parseAll()
  
  // 2. 生成路由数据 (新增)
  const routeData = await generateRouteData(docs)
  await writeRouteData(routeData) // 写入 .cache/routes.json
  
  // 3. 创建 Vite 服务器配置 (改进)
  const vite = await createViteServer({
    configFile: false,
    root: process.cwd(),
    
    plugins: [
      vue(),
      
      // 核心插件：提供路由数据
      routeDataPlugin(routeData),
      
      // 保留：Markdown 转 Vue 组件
      createMarkdownPlugin({ sourceDir, markdown: config.markdown }),
      
      // 新增：配置热重载
      createConfigHotReloadPlugin({ configFile }),
      
      // 新增：DocNode 数据提供
      docNodeDataPlugin(docs),
    ],
    
    server: {
      port: options.port || 3000,
    },
  })
  
  // 4. 启动服务器
  await vite.listen()
  
  // 5. 监听文件变化，自动重新解析
  setupFileWatcher(parserSystem, vite)
}
```

### 2.2 Vite 插件：路由数据提供
**文件**: `src/vite/plugins/route-data.ts`
```typescript
/**
 * 提供虚拟模块 '@ldesign/routes'
 * 让客户端可以 import routes from '@ldesign/routes'
 */
export function routeDataPlugin(routeData: RouteData): Plugin {
  const virtualModuleId = '@ldesign/routes'
  const resolvedId = '\0' + virtualModuleId
  
  return {
    name: 'ldesign-docs:route-data',
    
    resolveId(id) {
      if (id === virtualModuleId) return resolvedId
    },
    
    load(id) {
      if (id === resolvedId) {
        return `export default ${JSON.stringify(routeData)}`
      }
    },
    
    // HMR 支持
    handleHotUpdate({ file, server }) {
      if (file.includes('routes.json')) {
        // 重新加载路由数据
        server.ws.send({ type: 'full-reload' })
      }
    }
  }
}
```

### 2.3 更新应用入口读取路由
**文件**: `src/app/index.ts` (更新)
```typescript
import routes from '@ldesign/routes' // 虚拟模块

export function createViteApp(config: AppConfig = {}) {
  const app = createApp(Layout)
  
  // 使用生成的路由数据
  const router = createRouter({
    routes: generateRoutesFromData(routes),
    isDev: true,
  })
  
  // ...
}
```

---

## 🏗️ 第三阶段：Build 模式增强（2-3周）

### 3.1 混合构建策略
**文件**: `src/core/HybridBuilder.ts`

```typescript
/**
 * 混合构建器：结合 SPA + SSG 优势
 */
export class HybridBuilder {
  async build(docs: DocNode[], options: BuildOptions) {
    // 1. 生成 SPA 构建
    await this.buildSPA(docs, options)
    
    // 2. 预渲染关键页面 (SSG)
    await this.prerenderPages(docs, options)
    
    // 3. 生成搜索索引
    await this.buildSearchIndex(docs, options)
    
    // 4. 优化输出
    await this.optimizeBuild(options)
  }
  
  private async buildSPA(docs: DocNode[], options: BuildOptions) {
    // 使用 Vite 构建 SPA
    const routeData = await generateRouteData(docs)
    
    await build({
      root: options.sourceDir,
      build: {
        outDir: options.outputDir,
        rollupOptions: {
          input: {
            main: resolve(__dirname, '../templates/index.html')
          }
        }
      },
      plugins: [
        vue(),
        routeDataPlugin(routeData),
        // ... 其他插件
      ]
    })
  }
  
  private async prerenderPages(docs: DocNode[], options: BuildOptions) {
    // 使用现有的 StaticSiteEngine 预渲染
    // 但只渲染首页、404 等关键页面
    const criticalPages = docs.filter(d => d.metadata.prerender)
    
    const siteEngine = new StaticSiteEngine({ ... })
    await siteEngine.generate(criticalPages)
  }
}
```

### 3.2 更新 `build` 命令
**文件**: `src/cli/commands/build.ts`
```typescript
export async function buildCommand(options) {
  const config = await loadConfig(options.config)
  const generator = new DocsGenerator(config)
  
  // 根据配置选择构建模式
  const buildMode = config.build?.mode || 'hybrid'
  
  switch (buildMode) {
    case 'spa':
      // 纯 SPA 构建
      await generator.buildSPA()
      break
    
    case 'ssg':
      // 纯静态构建 (兼容旧版)
      await generator.generate()
      break
    
    case 'hybrid':
      // 混合构建 (推荐)
      await generator.buildHybrid()
      break
  }
}
```

---

## 🔌 第四阶段：插件系统适配（1-2周）

### 4.1 插件 API 扩展
**文件**: `src/types/index.ts` (扩展 DocsPlugin)
```typescript
export interface DocsPlugin {
  // ... 现有钩子保留
  
  // 新增：Vite 插件钩子
  vitePlugin?: (config: ViteConfig) => VitePlugin | VitePlugin[]
  
  // 新增：路由钩子
  extendRoutes?: (routes: RouteRecordRaw[]) => RouteRecordRaw[]
  
  // 新增：Vue 组件注册
  registerComponents?: (app: App) => void
  
  // 新增：客户端脚本
  clientSetup?: () => void
}
```

### 4.2 插件适配示例
**现有插件自动兼容**:
```typescript
// 现有的 typedocPlugin
export function typedocPlugin(options) {
  return {
    name: 'typedoc',
    version: '1.0.0',
    
    // 旧钩子继续工作 ✅
    parse: async (context) => {
      // 解析 TypeScript API
      // 返回 DocNode[]
    },
    
    // 新钩子可选添加 (增强但不必须)
    vitePlugin: (config) => {
      // 可以返回 Vite 插件
      return createTypeDocVitePlugin(options)
    }
  }
}
```

---

## 📊 第五阶段：性能优化（1周）

### 5.1 增量构建优化
- 利用现有的 `IncrementalBuilder`
- 在 dev 模式下只重新解析变更文件
- 路由数据增量更新

### 5.2 缓存策略
- 解析结果缓存 (已有 ✅)
- 路由数据缓存 (新增)
- Markdown 编译缓存 (新增)

### 5.3 代码分割
- 路由级别懒加载 (已实现 ✅)
- 组件按需加载
- 第三方库分离

---

## 🧪 第六阶段：测试和文档（1周）

### 6.1 测试覆盖
```
__tests__/
├── app/
│   ├── router.test.ts      # 路由生成测试
│   ├── store.test.ts       # 状态管理测试
│   └── integration.test.ts # 集成测试
├── modes/
│   ├── dev-mode.test.ts    # Dev 模式测试
│   ├── build-mode.test.ts  # Build 模式测试
│   └── generate-mode.test.ts # Generate 模式测试
└── compatibility/
    └── backward-compat.test.ts # 向后兼容测试
```

### 6.2 迁移指南
**文件**: `docs/MIGRATION.md`
```markdown
# 从旧版迁移到 v3.0

## 无需修改的场景
- ✅ 使用 `generate` 命令的项目完全兼容
- ✅ 所有现有插件继续工作
- ✅ 配置文件格式保持兼容

## 推荐升级的场景
- 使用新的 `dev` 命令获得 VitePress 体验
- 使用 `build --mode=hybrid` 获得最优性能
```

---

## 📁 文件结构总览

```
src/
├── app/                    # 🆕 SPA 应用入口
│   ├── index.ts           # 应用入口
│   ├── router.ts          # 路由系统
│   ├── store.ts           # 状态管理
│   ├── components.ts      # 全局组件注册
│   └── route-data-generator.ts # 路由数据生成
│
├── cli/                    # CLI 命令
│   ├── commands/          # 🔄 重构命令
│   │   ├── dev.ts        # Dev 命令 (重写)
│   │   ├── build.ts      # Build 命令 (增强)
│   │   └── generate.ts   # Generate 命令 (保留)
│   └── index.ts
│
├── core/                   # ✅ 核心模块保留
│   ├── DocsGenerator.ts   # 主生成器 (适配多模式)
│   ├── ParserSystem.ts    # 解析系统 (保留)
│   ├── PluginManager.ts   # 插件管理 (保留)
│   └── HybridBuilder.ts   # 🆕 混合构建器
│
├── vite/                   # Vite 集成
│   ├── plugins/
│   │   ├── markdown.ts    # ✅ 保留并增强
│   │   ├── route-data.ts  # 🆕 路由数据提供
│   │   └── doc-node-data.ts # 🆕 DocNode 数据提供
│   └── dev-server.ts      # 🔄 开发服务器 (改进)
│
├── generators/             # ✅ 生成器保留
│   ├── StaticSiteEngine.ts # SSG 引擎 (保留)
│   ├── TemplateEngine.ts   # 模板引擎 (保留)
│   └── ...
│
├── plugins/                # ✅ 所有插件保留
│   ├── parsers/           # 解析器插件
│   ├── enhancements/      # 增强插件
│   └── integrations/      # 集成插件
│
├── templates/              # 模板
│   ├── index.html         # 🆕 SPA 入口模板
│   ├── api-doc.vue        # 🆕 API 文档组件
│   ├── component-doc.vue  # 🆕 组件文档组件
│   └── vitepress-default/ # ✅ 主题保留
│
└── types/                  # 类型定义
    ├── index.ts           # ✅ 现有类型保留
    └── modes.ts           # 🆕 模式类型
```

---

## 🎯 兼容性保证

### 向后兼容策略

#### 1. 命令行兼容
```bash
# 旧版命令继续工作 ✅
ldesign-docs generate   # 使用 SSG 模式
ldesign-docs build      # 默认使用 hybrid 模式，可配置

# 新命令提供增强体验 🆕
ldesign-docs dev        # SPA 开发模式
ldesign-docs build --mode=spa     # SPA 构建
ldesign-docs build --mode=ssg     # SSG 构建 (等同于 generate)
ldesign-docs build --mode=hybrid  # 混合构建 (推荐)
```

#### 2. 配置文件兼容
```typescript
// 旧配置完全兼容 ✅
export default defineConfig({
  sourceDir: './src',
  outputDir: './docs',
  plugins: [
    typedocPlugin({ ... }),
    vueComponentPlugin({ ... }),
  ],
  // ... 所有旧配置项
})

// 新配置可选添加 🆕
export default defineConfig({
  // ... 旧配置
  
  // 新增：运行模式配置 (可选)
  mode: {
    dev: 'spa',        // dev 命令使用 SPA 模式
    build: 'hybrid',   // build 命令使用混合模式
  },
  
  // 新增：构建优化 (可选)
  build: {
    prerender: true,   // 预渲染关键页面
    ssr: true,        // 启用 SSR
  }
})
```

#### 3. 插件 API 兼容
```typescript
// 旧插件无需修改 ✅
export function myPlugin() {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    parse: async (context) => { ... },
    generate: async (context) => { ... },
  }
}

// 新插件可以使用新 API 🆕
export function myEnhancedPlugin() {
  return {
    // ... 旧 API
    
    // 可选：新 API
    vitePlugin: () => createMyVitePlugin(),
    extendRoutes: (routes) => [...routes, myRoute],
  }
}
```

---

## 📈 实施时间线

| 阶段 | 周数 | 关键产出 | 兼容性 |
|------|------|---------|--------|
| 阶段1: 基础设施 | 2周 | SPA 应用骨架 | ✅ 无破坏 |
| 阶段2: Dev 模式 | 2周 | VitePress 开发体验 | ✅ generate 命令不变 |
| 阶段3: Build 模式 | 2-3周 | 混合构建能力 | ✅ 可选配置 |
| 阶段4: 插件适配 | 1-2周 | 插件 API 扩展 | ✅ 旧插件继续工作 |
| 阶段5: 性能优化 | 1周 | 性能提升 | ✅ 透明优化 |
| 阶段6: 测试文档 | 1周 | 完整测试 | ✅ 向后兼容测试 |

**总计**: 9-12周 (约 2-3个月)

---

## ✅ 验收标准

### 功能验收
- [ ] `dev` 命令启动 SPA，支持 HMR
- [ ] `build` 命令生成混合输出
- [ ] `generate` 命令保持原有行为
- [ ] 所有现有插件正常工作
- [ ] 所有现有测试通过

### 性能验收
- [ ] Dev 启动时间 < 1s
- [ ] HMR 更新 < 200ms
- [ ] 构建时间不增加超过 20%
- [ ] 输出体积不增加超过 10%

### 兼容性验收
- [ ] 旧配置文件无需修改即可运行
- [ ] 所有现有示例项目正常工作
- [ ] 插件 API 向后兼容

---

## 🎉 最终效果

### 用户视角

#### 开发模式
```bash
# 启动开发服务器
ldesign-docs dev

✨ Vite 开发服务器已启动！
➜  本地: http://localhost:3000
➜  网络: http://192.168.1.100:3000

# 体验
✅ 即时热更新 (< 200ms)
✅ 客户端路由切换 (无刷新)
✅ VitePress 同等体验
✅ 自动文档生成 (TypeDoc/Component)
```

#### 构建模式
```bash
# 混合构建 (推荐)
ldesign-docs build

🏗️  开始构建文档...
✓ 解析源文件 (231个文档)
✓ 生成 SPA 路由
✓ 预渲染关键页面 (15个)
✓ 构建搜索索引
✓ 优化输出
✨ 构建完成！耗时 8.2s

# 输出
dist/
├── index.html          # 预渲染的首页
├── 404.html           # 预渲染的 404
├── assets/            # SPA 资源
│   ├── index.js       # 主应用
│   ├── chunk-*.js     # 路由分块
│   └── style.css      # 样式
└── search-index.json  # 搜索索引
```

#### 兼容模式
```bash
# 使用旧的纯 SSG 模式
ldesign-docs generate

# 或者
ldesign-docs build --mode=ssg

# 完全等同于旧版行为 ✅
```

---

## 🚀 下一步行动

1. **Review 本方案** - 确认技术方案和时间线
2. **创建 Feature Branch** - `feature/vitepress-integration`
3. **阶段 1 开发** - 从基础设施开始
4. **持续集成** - 每个阶段完成后合并到主分支

---

**优势总结**:
✅ 保留所有现有功能和插件
✅ 提供 VitePress 级别的开发体验
✅ 向后完全兼容
✅ 渐进式升级路径
✅ 最优性能输出
