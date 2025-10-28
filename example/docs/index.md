---
title: 首页
description: 测试文档站点首页
---

# 欢迎使用 LDesign Docs Generator v3.0

这是一个测试文档站点，用于验证 VitePress 功能实现。

## ✨ 主要特性

- **⚡ 极速开发** - Vite 驱动，启动 < 1s
- **🔥 热更新** - HMR 更新 < 200ms  
- **🚀 客户端路由** - 无刷新页面切换
- **📝 Markdown 增强** - 容器、代码高亮、Emoji
- **🎨 主题切换** - 支持暗黑模式

## 📚 快速开始

查看 [快速开始指南](./guide/getting-started.md) 了解如何使用。

## 🎯 功能列表

::: tip 提示
这是一个 Markdown 容器示例
:::

::: warning 警告
请注意这是 v3.0 alpha 版本
:::

## 代码示例

```typescript
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  sourceDir: './docs',
  outputDir: './dist',
  site: {
    title: '文档站点',
  },
})
```

## Emoji 支持

支持 Emoji :tada: :rocket: :sparkles:
