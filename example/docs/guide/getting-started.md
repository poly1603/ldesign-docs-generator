---
title: 快速开始
---

# 快速开始

本指南将帮助你快速上手 LDesign Docs Generator。

## 安装

```bash
pnpm add -D @ldesign/docs-generator
```

## 配置

创建配置文件 `docs-generator.config.ts`:

```typescript
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  sourceDir: './docs',
  outputDir: './dist',
  
  site: {
    title: '我的文档',
    description: '使用 LDesign Docs Generator 构建',
  },
})
```

## 开发

启动开发服务器：

```bash
pnpm ldesign-docs dev
```

::: tip 开发体验
- 启动时间 < 1s
- HMR 更新 < 200ms
- 客户端路由切换
:::

## 构建

构建生产版本：

```bash
# 混合模式（推荐）
pnpm ldesign-docs build

# SPA 模式
pnpm ldesign-docs build --mode spa

# SSG 模式
pnpm ldesign-docs build --mode ssg
```

## 下一步

- 查看 [API 文档](../api/core.md)
- 了解 [配置选项](./configuration.md)
