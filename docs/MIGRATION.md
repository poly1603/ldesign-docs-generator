# 📖 迁移指南 - v3.0 双模式架构

## 🎯 概述

v3.0 引入了**双模式架构**，在保留所有现有功能的同时，提供 VitePress 级别的开发体验。

---

## ✅ 向后兼容保证

### 完全兼容的场景

以下使用方式**无需任何修改**即可继续工作：

```bash
# 1. 生成命令（完全保留）
ldesign-docs generate

# 2. 构建命令（默认混合模式）
ldesign-docs build

# 3. 所有现有插件
typedocPlugin({ ... })
vueComponentPlugin({ ... })
markdownPlugin({ ... })

# 4. 所有现有配置
export default defineConfig({
  sourceDir: './src',
  outputDir: './docs',
  plugins: [/* ...现有插件 */],
  // ...所有旧配置
})
```

---

## 🆕 新功能

### 1. Dev 模式 - SPA 开发体验

```bash
# 启动 SPA 开发服务器
ldesign-docs dev

# 特性：
✅ 启动时间 < 1s
✅ HMR 热更新 < 200ms
✅ 客户端路由（无刷新）
✅ VitePress 级别体验
```

### 2. Build 模式选择

```bash
# 纯 SPA 构建
ldesign-docs build --mode spa

# 纯 SSG 构建（等同于旧版 generate）
ldesign-docs build --mode ssg

# 混合构建（推荐，默认）
ldesign-docs build --mode hybrid
```

---

## 🔄 从旧版迁移

### 场景 1: 继续使用旧模式（零修改）

如果您满意当前的静态站点生成，**无需任何修改**：

```bash
# 继续使用
ldesign-docs generate

# 或者使用等价的新命令
ldesign-docs build --mode ssg
```

### 场景 2: 升级到 SPA 模式（推荐）

#### 步骤 1: 测试 dev 模式

```bash
ldesign-docs dev
```

访问 `http://localhost:3000`，体验 SPA 开发模式。

#### 步骤 2: 调整构建模式

```bash
# 使用混合模式（推荐）
ldesign-docs build --mode hybrid

# 输出：
# - SPA 单页应用（主体）
# - 首页和关键页面预渲染（SEO）
# - 搜索索引、sitemap.xml、robots.txt
```

#### 步骤 3: 更新配置（可选）

```typescript
// docs-generator.config.ts
export default defineConfig({
  // ... 现有配置保留

  // 可选：指定默认构建模式
  build: {
    mode: 'hybrid',  // 'spa' | 'ssg' | 'hybrid'
    prerender: true, // 是否预渲染关键页面
  },

  // 可选：Vite 配置
  vite: {
    server: {
      port: 5173,
    },
  },
})
```

---

## 📊 模式对比

| 特性 | generate | build --mode ssg | build --mode spa | build --mode hybrid |
|------|----------|------------------|------------------|---------------------|
| 输出类型 | 静态 HTML | 静态 HTML | SPA | SPA + 预渲染 |
| 客户端路由 | ❌ | ❌ | ✅ | ✅ |
| SEO 友好 | ✅ | ✅ | ⚠️ | ✅ |
| 首屏速度 | 快 | 快 | 中 | 快 |
| 页面切换 | 刷新 | 刷新 | 即时 | 即时 |
| 推荐场景 | 旧项目兼容 | 纯静态站点 | 单页应用 | **通用推荐** |

---

## 🔧 配置迁移

### 旧配置（完全兼容）

```typescript
export default defineConfig({
  sourceDir: './src',
  outputDir: './docs',
  plugins: [
    typedocPlugin({ tsconfig: './tsconfig.json' }),
    vueComponentPlugin({ include: '**/*.vue' }),
  ],
  site: {
    title: '文档',
    description: '文档站点',
  },
  theme: {
    name: 'default',
  },
})
```

### 新配置（可选扩展）

```typescript
export default defineConfig({
  // ... 所有旧配置保留

  // 新增：运行模式配置（可选）
  mode: {
    dev: 'spa',        // dev 命令使用 SPA
    build: 'hybrid',   // build 命令使用混合模式
  },

  // 新增：构建配置（可选）
  build: {
    prerender: true,   // 预渲染关键页面
    ssr: false,        // 是否启用 SSR（实验性）
  },

  // 新增：Vite 配置（可选）
  vite: {
    server: { port: 5173 },
    build: { minify: 'terser' },
  },
})
```

---

## 🐛 常见问题

### Q: 升级后现有功能会被破坏吗？

**A**: 不会。所有新功能都是**增量添加**，不修改现有代码。`generate` 命令完全保留。

### Q: 插件需要修改吗？

**A**: **不需要**。所有现有插件（typedocPlugin、vueComponentPlugin 等）自动兼容。

插件可以**选择性扩展**新 API：

```typescript
export function myPlugin(options) {
  return {
    name: 'my-plugin',
    version: '1.0.0',

    // 旧 API（继续工作）
    parse: async (context) => { /* ... */ },

    // 新 API（可选）
    vitePlugin: () => createMyVitePlugin(),
    extendRoutes: (routes) => [...routes, myRoute],
  }
}
```

### Q: dev 模式和 generate 有什么区别？

| 维度 | generate | dev |
|------|----------|-----|
| 启动方式 | 先生成 HTML → 启动静态服务器 | 直接启动 Vite + SPA |
| 更新速度 | 需要重新生成 (慢) | HMR 即时更新 (快) |
| 路由方式 | 超链接跳转 (刷新) | 客户端路由 (无刷新) |
| 适用场景 | 最终验证、部署前预览 | 日常开发 |

### Q: 如何选择构建模式？

- **hybrid**（推荐）：通用场景，兼顾性能和 SEO
- **spa**：纯单页应用，不需要 SEO
- **ssg**：纯静态站点，兼容旧版

### Q: 构建输出的文件结构有什么变化？

#### SSG 模式（旧版相同）
```
dist/
├── index.html
├── guide/
│   └── getting-started.html
└── assets/
    └── styles.css
```

#### SPA/Hybrid 模式（新增）
```
dist/
├── index.html              # SPA 入口
├── 404.html                # 预渲染（hybrid）
├── assets/
│   ├── index-abc123.js     # SPA 主应用
│   ├── chunk-def456.js     # 路由分块
│   └── style-ghi789.css    # 样式
├── search-index.json       # 搜索索引
├── sitemap.xml             # 站点地图
└── robots.txt              # SEO
```

---

## 📈 性能对比

| 指标 | 旧版 (generate) | v3.0 (dev) | v3.0 (build --mode hybrid) |
|------|-----------------|------------|----------------------------|
| 冷启动时间 | ~5-10s | **< 1s** | N/A |
| 文件修改更新 | ~2-5s | **< 200ms** | N/A |
| 页面切换 | 完整刷新 | **即时** | **即时** |
| 首屏加载 | 快 | 中 | **快** |
| SEO | ✅ | ⚠️ | ✅ |

---

## 🚀 推荐迁移路径

### 阶段 1: 尝试新 dev 模式（0 风险）

```bash
# 不改任何配置，直接尝试
ldesign-docs dev
```

### 阶段 2: 测试混合构建（低风险）

```bash
# 构建并预览
ldesign-docs build --mode hybrid
ldesign-docs serve
```

### 阶段 3: 正式切换（高收益）

```typescript
// 更新 package.json
{
  "scripts": {
    "docs:dev": "ldesign-docs dev",      // 新
    "docs:build": "ldesign-docs build",  // 默认 hybrid
    "docs:preview": "ldesign-docs serve"
  }
}
```

---

## 📚 更多资源

- [完整重构计划](../REFACTORING_PLAN.md) - 技术细节
- [快速开始指南](../QUICK_START_REFACTORING.md) - 开发指南
- [进度报告](../PROGRESS_REPORT.md) - 当前进度

---

**更新时间**: 2025-10-28  
**版本**: v3.0.0-alpha  
**兼容性**: 向后 100% 兼容
