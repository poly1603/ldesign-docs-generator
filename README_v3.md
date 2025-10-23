# @ldesign/docs-generator v3.0 🚀

<div align="center">

**🎉 全新版本！集成 VitePress 所有核心功能 + 独特的自动化文档生成**

[![Version](https://img.shields.io/badge/version-3.0.0--alpha.1-blue.svg)](./CHANGELOG.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

</div>

## ✨ v3.0 新特性

### 🚀 Vite 驱动的开发体验

```bash
# 极速的开发服务器（<1s 启动）
npx ldesign-docs dev

# 支持热模块替换（HMR）
# Markdown 文件变更 → 即时刷新
# 配置文件变更 → 自动重启
```

### 📝 完整的 Markdown 增强

**容器语法**:
```markdown
::: tip 提示
这是一个提示容器
:::

::: warning 注意
这是一个警告容器
:::

::: danger 危险
这是一个危险容器
:::
```

**代码块增强**:
````markdown
```ts {1,3-5}
// 高亮第 1 行和 3-5 行
const hello = 'world'
```

::: code-group
```ts title="config.ts"
export default { title: 'TS' }
```
```js title="config.js"
module.exports = { title: 'JS' }
```
:::
````

**更多增强**:
- ✅ 行号显示
- ✅ Emoji 支持 `:tada:` → 🎉
- ✅ 自定义锚点 `{#custom}`
- ✅ 代码导入 `@[code](./file.ts)`
- ✅ 外部链接图标

### 🎨 VitePress 风格主题（进行中）

- 精美的默认主题
- 暗黑模式支持
- 响应式设计
- 移动端适配

## 📦 安装

```bash
pnpm add -D @ldesign/docs-generator@next
# 或
npm install -D @ldesign/docs-generator@next
```

## 🚀 快速开始

### 1. 初始化

```bash
npx ldesign-docs init
```

### 2. 配置

```typescript
// docs-generator.config.ts
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  sourceDir: './src',
  outputDir: './docs',

  // ✨ 新增：Vite 配置
  vite: {
    server: {
      port: 5173,
      open: true,
    },
  },

  // ✨ 新增：Markdown 配置
  markdown: {
    lineNumbers: true,
    containers: true,
    emoji: true,
    anchor: true,
    theme: 'dark-plus',
  },

  plugins: [
    // ... 你的插件
  ],
})
```

### 3. 启动开发服务器

```bash
# 使用 Vite 开发服务器（推荐）
npx ldesign-docs dev

# 或指定端口
npx ldesign-docs dev --port 5173 --open
```

### 4. 构建

```bash
npx ldesign-docs build
```

## 🎯 核心特性对比

| 功能 | VitePress | v2.0 | **v3.0** |
|------|-----------|------|----------|
| **开发服务器** | Vite + HMR | HTTP | ✅ Vite + HMR |
| **Markdown 容器** | ✅ | ❌ | ✅ 完整支持 |
| **代码增强** | ✅ | ❌ | ✅ 行号/高亮/组 |
| **Emoji** | ✅ | ❌ | ✅ |
| **锚点** | ✅ | ⚠️ | ✅ 自定义 |
| **默认主题** | ✅ | ⚠️ | 🚧 进行中 |
| **API 自动生成** | ❌ | ✅ | ✅ 增强 |
| **组件文档** | ❌ | ✅ | ✅ 增强 |
| **Playground** | ❌ | ✅ | ✅ |

## 🆚 v3.0 vs VitePress

### VitePress 的优势
- ✅ 成熟稳定
- ✅ Vue 官方出品
- ✅ 庞大社区

### v3.0 的优势
- ✅ **自动化文档生成**（TypeScript API/Vue React 组件）
- ✅ **交互式 Playground**
- ✅ **企业级插件系统**（依赖管理、配置验证）
- ✅ **增量解析**（5-10倍性能提升）
- ✅ **多版本管理**
- ✅ **完整的 VitePress 功能**（新增！）

## 📖 文档示例

### 容器

```markdown
::: tip 快速提示
v3.0 使用 Vite 驱动，开发体验极佳！
:::

::: warning 重要提醒
这是 alpha 版本，可能存在一些问题。
:::

::: details 点击查看详情
这里是详细的内容...
:::
```

### 代码块

````markdown
```typescript {2-4}
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  sourceDir: './src',
  outputDir: './docs',
})
```
````

### 代码组

````markdown
::: code-group

```typescript title="TypeScript"
const hello: string = 'world'
```

```javascript title="JavaScript"
const hello = 'world'
```

:::
````

## 🔧 CLI 命令

```bash
# 开发（使用 Vite）
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
```

## 📁 项目结构

```
my-project/
├── docs-generator.config.ts  # 配置文件
├── src/                       # 源代码
│   ├── index.ts              # API 文档
│   ├── components/           # 组件文档
│   └── guide/               # Markdown 文档
└── docs/                     # 生成的文档
```

## 🛣️ 路线图

### v3.0.0-alpha.1 ✅ (当前)
- ✅ Vite 开发服务器
- ✅ HMR 支持
- ✅ Markdown 容器
- ✅ 代码块增强
- ✅ Emoji/锚点/导入

### v3.0.0-alpha.2 (下一个)
- [ ] Shiki 语法高亮
- [ ] 完整 VitePress 主题
- [ ] 暗黑模式 UI
- [ ] Markdown 中使用 Vue 组件

### v3.0.0-beta.1
- [ ] 国际化（i18n）
- [ ] 导航增强
- [ ] 构建优化

### v3.0.0 (正式版)
- [ ] 所有功能完成
- [ ] 完整文档
- [ ] 90%+ 测试覆盖

## 📚 文档

- [快速开始](./QUICK_START.md)
- [配置参考](./docs/configuration.md)
- [Markdown 增强](./docs/markdown.md)
- [插件开发](./docs/plugin-development.md)
- [主题开发](./docs/theme-development.md)
- [迁移指南](./docs/migration-guide.md)

## 🤝 贡献

欢迎贡献！查看 [贡献指南](./docs/CONTRIBUTING.md)。

## 📄 License

MIT License © LDesign Team

---

<div align="center">

**从 v2.0 的智能文档生成器**

**升级为包含 VitePress 所有功能的企业级解决方案！**

[开始使用](./QUICK_START.md) · [查看示例](./examples/) · [报告问题](https://github.com/ldesign/ldesign/issues)

</div>


