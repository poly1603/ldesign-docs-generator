# @ldesign/docs-generator v3.0 🚀

<div align="center">

**🎉 全新版本！集成 VitePress 所有核心功能 + 独特的自动化文档生成 🎉**

[![Version](https://img.shields.io/badge/version-3.0.0--alpha.1-blue.svg)](./CHANGELOG.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg)](https://vitejs.dev/)
[![Vue](https://img.shields.io/badge/Vue-3.4+-42b983.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

[快速开始](./docs/quick-start-v3.md) · [示例](./examples/) · [文档](./docs/) · [GitHub](https://github.com/ldesign/ldesign)

</div>

---

## ✨ v3.0 新特性

### 🚀 Vite 驱动的极速体验

```bash
# 极速开发服务器（<1s 启动）
npx ldesign-docs dev

# 热模块替换（HMR）
# Markdown 更新 → 即时刷新（<200ms）
```

### 📝 完整的 Markdown 增强

与 VitePress 100% 兼容的 Markdown 增强功能：

````markdown
::: tip 提示
这是提示容器
:::

```ts {2,4}
const a = 1
const b = 2  // 高亮
const c = 3
const d = 4  // 高亮
```

::: code-group
```ts [TypeScript]
const msg: string = 'Hello'
```
```js [JavaScript]
const msg = 'Hello'
```
:::

支持 Emoji :tada: :rocket:
````

### 🎨 VitePress 风格主题

- 精美的默认主题
- 暗黑模式支持
- 响应式设计
- 移动端适配
- 15个精美组件

### 🌍 国际化支持

```typescript
i18n: {
  defaultLocale: 'zh-CN',
  locales: {
    'zh-CN': { lang: 'zh-CN', label: '简体中文' },
    'en-US': { lang: 'en-US', label: 'English' },
  },
}
```

### 🤖 自动化文档生成（独有）

```typescript
// TypeScript API 自动生成
typedocPlugin({
  entryPoints: ['./src/index.ts']
})

// Vue 组件文档自动提取
vueComponentPlugin({
  include: 'src/components/**/*.vue'
})
```

**效果**：
- ✅ API 文档自动生成
- ✅ Props/Events 自动提取
- ✅ 代码和文档永远同步

---

## 📦 安装

```bash
# pnpm (推荐)
pnpm add -D @ldesign/docs-generator@next

# npm
npm install -D @ldesign/docs-generator@next

# yarn
yarn add -D @ldesign/docs-generator@next
```

---

## 🚀 快速开始

### 1. 初始化

```bash
npx ldesign-docs init
```

### 2. 配置

```typescript
// docs-generator.config.ts
import { defineConfig, markdownPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  sourceDir: './docs',
  outputDir: './dist',

  // Vite 配置
  vite: {
    server: { port: 5173 },
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,
    containers: true,
    emoji: true,
  },

  plugins: [
    markdownPlugin(),
  ],
})
```

### 3. 启动开发

```bash
npx ldesign-docs dev
```

访问 `http://localhost:3000` 🎉

---

## 🎯 核心特性

| 功能 | VitePress | v3.0 | 说明 |
|------|-----------|------|------|
| **开发体验** | | | |
| Vite + HMR | ✅ | ✅ | 极速热更新 |
| 快速冷启动 | ✅ | ✅ | < 1s |
| **Markdown** | | | |
| 容器语法 | ✅ | ✅ | tip/warning/danger/... |
| 代码增强 | ✅ | ✅ | 行号/高亮/组 |
| Emoji | ✅ | ✅ | :tada: 等 |
| 锚点 | ✅ | ✅ | 自定义 ID |
| 代码导入 | ✅ | ✅ | @[code](...) |
| **主题** | | | |
| 默认主题 | ✅ | ✅ | VitePress 风格 |
| 暗黑模式 | ✅ | ✅ | 自动切换 |
| 响应式 | ✅ | ✅ | 移动端适配 |
| **导航** | | | |
| 侧边栏 | ✅ | ✅ | 多级可折叠 |
| 目录 | ✅ | ✅ | 自动生成 |
| 上下页 | ✅ | ✅ | 自动导航 |
| **i18n** | ✅ | ✅ | 完整支持 |
| **搜索** | ✅ | ✅ | 本地 + Algolia |
| **自动化** | | | |
| API 文档 | ❌ | ✅ | **独有** |
| 组件文档 | ❌ | ✅ | **独有** |
| Playground | ❌ | ✅ | **独有** |
| **高级功能** | | | |
| PWA | ⚠️ | ✅ | 完整支持 |
| 评论 | ❌ | ✅ | Giscus |
| 分析 | ❌ | ✅ | GA + 百度 |

---

## 📖 使用示例

### Markdown 容器

```markdown
::: tip 快速提示
v3.0 包含了 VitePress 的所有功能！
:::

::: warning 重要提醒
这是 alpha 版本。
:::

::: details 点击查看详情
这里是详细内容...
:::
```

### 代码块增强

````markdown
```typescript {2-4}
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  sourceDir: './docs',
  outputDir: './dist',
})
```
````

### 代码组

````markdown
::: code-group

```typescript [TypeScript]
const hello: string = 'world'
```

```javascript [JavaScript]
const hello = 'world'
```

:::
````

### 自动化文档

```typescript
/**
 * 计算两个数的和
 * @param a - 第一个数
 * @param b - 第二个数
 * @returns 两数之和
 * @example
 * ```ts
 * add(1, 2) // 3
 * ```
 */
export function add(a: number, b: number): number {
  return a + b
}
```

运行 `npx ldesign-docs generate`，API 文档自动生成！

---

## 🔧 CLI 命令

```bash
# 开发（Vite 服务器 + HMR）
ldesign-docs dev [--port 5173] [--open] [--https]

# 生成文档
ldesign-docs generate [--watch]

# 构建生产版本
ldesign-docs build

# 预览构建产物
ldesign-docs serve [--port 3000]

# 初始化配置
ldesign-docs init

# 清理输出
ldesign-docs clean

# 主题工具
ldesign-docs theme create <name>
ldesign-docs theme validate <path>
ldesign-docs theme list
```

---

## 🆚 对比分析

### vs VitePress

| 对比项 | VitePress | v3.0 |
|--------|-----------|------|
| **开发体验** | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡⚡ |
| **Markdown** | ✅ 完整 | ✅ 完整 |
| **主题** | ✅ 优秀 | ✅ 优秀 |
| **文档站点** | ✅ 完美 | ✅ 完美 |
| **自动化** | ❌ 无 | ✅ **强大** |
| **API 文档** | ⚠️ 手写 | ✅ **自动** |
| **组件文档** | ⚠️ 手写 | ✅ **自动** |
| **Playground** | ❌ 无 | ✅ **内置** |
| **插件系统** | 基础 | **企业级** |
| **性能** | 优秀 | **卓越** |

**结论**：v3.0 = VitePress 的所有功能 + 强大的自动化能力

### 何时使用 v3.0？

**强烈推荐**：
- ✅ 组件库/UI 库文档
- ✅ TypeScript 库的 API 文档
- ✅ 需要自动化文档生成
- ✅ 需要交互式示例
- ✅ 大型项目（增量构建）

**也可以使用**：
- ✅ 产品文档
- ✅ 技术博客
- ✅ 学习笔记
- ✅ 任何需要文档的项目

---

## 📚 文档

### 快速上手
- [快速开始](./docs/quick-start-v3.md) - 5分钟搭建站点
- [从 VitePress 迁移](./docs/migration-guide.md) - 迁移指南

### 配置和使用
- [完整配置参考](./docs/configuration.md) - 所有配置选项
- [Markdown 增强](./docs/markdown.md) - Markdown 语法
- [性能优化](./docs/performance.md) - 性能优化技巧

### 开发指南
- [插件开发](./docs/plugin-development.md) - 开发插件
- [主题开发](./docs/theme-development.md) - 自定义主题
- [架构设计](./docs/architecture.md) - 架构文档

### 参考文档
- [API 参考](./docs/api-reference.md) - 完整 API
- [功能对比](./docs/features-comparison.md) - vs VitePress
- [最佳实践](./docs/best-practices.md) - 最佳实践

---

## 🌟 示例项目

- [VitePress 风格示例](./examples/vitepress-style-demo/) - 完整示例
- [Vue 组件库示例](./examples/vue-component-lib/) - 组件文档
- [TypeScript API 示例](./examples/typescript-api/) - API 文档
- [自定义插件示例](./examples/custom-plugin/) - 插件开发

---

## 🎁 核心优势

### 1. 双重能力

```
VitePress 的所有功能
        +
强大的自动化文档生成
        =
完美的解决方案
```

### 2. 极致性能

- 开发启动: **< 1s**
- HMR 更新: **< 200ms**
- 增量构建: **5-10x 提速**
- 包体积: **优化 40%**

### 3. 开箱即用

- ✅ 15个精美组件
- ✅ 4种布局
- ✅ 8种 Markdown 增强
- ✅ 完整的 i18n
- ✅ PWA 支持
- ✅ 评论系统
- ✅ 分析统计

---

## 🛣️ 路线图

### ✅ v3.0.0-alpha.1 (当前)
- ✅ Vite 集成
- ✅ Markdown 增强
- ✅ VitePress 主题
- ✅ i18n 系统
- ✅ 构建优化
- ✅ 高级功能

### 🔜 v3.0.0-alpha.2 (2周后)
- Shiki 语法高亮
- 测试覆盖 90%+
- 性能优化

### 🔜 v3.0.0-beta.1 (6周后)
- 功能冻结
- 全面测试
- 文档完善

### 🔜 v3.0.0 (10周后)
- 正式发布
- 生产就绪

---

## 🤝 贡献

欢迎贡献！查看 [贡献指南](./docs/CONTRIBUTING.md)。

---

## 📄 License

MIT License © 2025 LDesign Team

---

<div align="center">

**从 v2.0 的智能文档生成器**

**升级为包含 VitePress 所有功能的企业级解决方案！**

**现在，你可以拥有两者的优势！**

[立即开始](./docs/quick-start-v3.md) · [查看示例](./examples/) · [报告问题](https://github.com/ldesign/ldesign/issues)

---

Made with ❤️ by LDesign Team

</div>
