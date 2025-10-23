# @ldesign/docs-generator

<div align="center">

**🚀 智能文档生成器**

API 文档自动生成 · 组件文档提取 · 交互式示例 · 多版本支持 · AI 增强

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./CHANGELOG.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

</div>

## ✨ 特性

- 🎯 **API 文档自动生成** - 支持 TypeScript/JavaScript，基于 TypeDoc
- 🧩 **组件文档智能提取** - 支持 Vue/React，自动提取 Props/Events/Slots
- 📚 **Markdown 文档处理** - Frontmatter、TOC、代码高亮
- 🎨 **现代化文档站点** - 响应式布局、暗黑模式、自定义主题
- 🔍 **强大搜索功能** - 本地搜索，快速定位
- 🔌 **插件化架构** - 易于扩展，支持自定义插件
- ⚡ **高性能构建** - 增量构建、并行处理
- 📱 **SEO 友好** - 静态站点生成，搜索引擎优化

## 📦 安装

```bash
# pnpm
pnpm add -D @ldesign/docs-generator

# npm
npm install -D @ldesign/docs-generator

# yarn
yarn add -D @ldesign/docs-generator
```

## 🚀 快速开始

### 1. 初始化配置

```bash
npx ldesign-docs init
```

这将创建一个 `docs-generator.config.js` 配置文件。

### 2. 配置文档生成器

```typescript
// docs-generator.config.ts
import { defineConfig, typedocPlugin, vueComponentPlugin, markdownPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  sourceDir: './src',
  outputDir: './docs',
  
  plugins: [
    typedocPlugin({ tsconfig: './tsconfig.json' }),
    vueComponentPlugin({ include: '**/*.vue' }),
    markdownPlugin({ include: '**/*.md' }),
  ],
  
  site: {
    title: '我的文档',
    description: '自动生成的文档站点',
  },
})
```

### 3. 生成文档

```bash
# 生成文档
npx ldesign-docs generate

# 或使用别名
npx ldesign-docs gen

# 构建生产版本
npx ldesign-docs build

# 预览文档
npx ldesign-docs serve
```

## 📖 插件使用

### TypeDoc 插件（TypeScript API 文档）

```typescript
import { typedocPlugin } from '@ldesign/docs-generator'

typedocPlugin({
  tsconfig: './tsconfig.json',
  entryPoints: ['./src/index.ts'],
  includePrivate: false,
})
```

### Vue 组件插件

```typescript
import { vueComponentPlugin } from '@ldesign/docs-generator'

vueComponentPlugin({
  include: '**/*.vue',
  exclude: '**/node_modules/**',
})
```

### React 组件插件

```typescript
import { reactComponentPlugin } from '@ldesign/docs-generator'

reactComponentPlugin({
  include: '**/*.{tsx,jsx}',
  exclude: '**/node_modules/**',
})
```

### Markdown 插件

```typescript
import { markdownPlugin } from '@ldesign/docs-generator'

markdownPlugin({
  include: '**/*.md',
  exclude: '**/node_modules/**',
})
```

## 🎨 主题定制

```typescript
export default defineConfig({
  theme: {
    name: 'default', // 或自定义主题名称
    styles: {
      primaryColor: '#3498db',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      sidebarWidth: '280px',
      contentMaxWidth: '1200px',
    },
  },
})
```

## 🗺️ 导航配置

```typescript
export default defineConfig({
  navigation: {
    // 自动生成侧边栏
    sidebar: 'auto',
    
    // 或手动配置
    sidebar: [
      {
        text: 'API',
        items: [
          { text: '核心', link: '/api/core' },
          { text: '工具', link: '/api/utils' },
        ],
      },
    ],
    
    // 顶部导航
    topbar: [
      { text: '首页', link: '/' },
      { text: 'API', link: '/api/' },
      { text: '组件', link: '/components/' },
    ],
  },
})
```

## 📝 编写文档

### TypeScript API 文档

使用 TSDoc 注释：

```typescript
/**
 * 计算两个数的和
 * 
 * @param a - 第一个数
 * @param b - 第二个数
 * @returns 两数之和
 * 
 * @example
 * ```ts
 * add(1, 2) // 3
 * ```
 */
export function add(a: number, b: number): number {
  return a + b
}
```

### Vue 组件文档

```vue
<template>
  <button @click="handleClick">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
/**
 * Button 组件
 * 
 * 基础按钮组件，支持多种类型和尺寸
 */

interface Props {
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'danger'
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  /** 点击事件 */
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>
```

### Markdown 文档

```markdown
---
title: 快速开始
description: 了解如何快速开始使用
---

# 快速开始

这是一个示例文档...
```

## 🛠️ CLI 命令

```bash
# 生成文档
ldesign-docs generate [options]
ldesign-docs gen [options]

# 构建生产版本
ldesign-docs build [options]

# 预览文档
ldesign-docs serve [options]

# 初始化配置
ldesign-docs init

# 清理输出目录
ldesign-docs clean
```

### CLI 选项

```bash
# generate 命令
-c, --config <path>     配置文件路径 (默认: docs-generator.config.js)
-s, --source <dir>      源目录
-o, --output <dir>      输出目录
-w, --watch             监听模式
--log-level <level>     日志级别 (silent|error|warn|info|debug)

# serve 命令
-p, --port <port>       端口号 (默认: 3000)
-d, --dir <dir>         文档目录 (默认: ./docs)
--open                  自动打开浏览器

# clean 命令
-o, --output <dir>      输出目录 (默认: ./docs)
```

## 🔧 编程式 API

```typescript
import { DocsGenerator } from '@ldesign/docs-generator'

const generator = new DocsGenerator({
  sourceDir: './src',
  outputDir: './docs',
  plugins: [
    // ...
  ],
})

await generator.generate()
```

## 📚 更多资源

- [完整配置示例](./docs-generator.config.example.ts)
- [插件开发指南](./docs/plugin-development.md)
- [主题开发指南](./docs/theme-development.md)
- [更新日志](./CHANGELOG.md)

## 🤝 贡献

欢迎提交 Pull Request 和 Issue！

## 📄 License

MIT License © LDesign Team






