# 快速开始

## 安装

```bash
# pnpm (推荐)
pnpm add -D @ldesign/docs-generator@next

# npm
npm install -D @ldesign/docs-generator@next

# yarn
yarn add -D @ldesign/docs-generator@next
```

---

## 5分钟快速开始

### 1. 初始化

```bash
npx ldesign-docs init
```

这将创建 `docs-generator.config.ts` 配置文件。

### 2. 配置

```typescript
// docs-generator.config.ts
import { defineConfig, markdownPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  sourceDir: './docs',
  outputDir: './dist',

  site: {
    title: '我的文档',
    description: '强大的文档站点',
  },

  plugins: [
    markdownPlugin(),
  ],

  markdown: {
    lineNumbers: true,
    containers: true,
    emoji: true,
  },
})
```

### 3. 创建首页

创建 `docs/index.md`：

```markdown
---
layout: home
---

# 欢迎使用

这是首页内容。

::: tip 提示
v3.0 使用 Vite 驱动，开发体验极佳！
:::

## 特性

- ⚡ Vite 驱动
- 🎨 Markdown 增强
- 🌍 国际化支持
```

### 4. 启动开发服务器

```bash
npx ldesign-docs dev
```

访问 `http://localhost:3000` 即可看到你的文档站点！

---

## 添加更多页面

### 创建指南页面

创建 `docs/guide/introduction.md`：

```markdown
---
title: 介绍
description: 了解文档生成器
---

# 介绍

欢迎使用 @ldesign/docs-generator v3.0！

## 什么是文档生成器？

这是一个强大的工具...
```

### 更新导航

```typescript
export default defineConfig({
  navigation: {
    topbar: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/introduction' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/quick-start' },
          ],
        },
      ],
    },
  },
})
```

---

## 自动化文档生成

### TypeScript API 文档

```typescript
import { typedocPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  plugins: [
    typedocPlugin({
      tsconfig: './tsconfig.json',
      entryPoints: ['./src/index.ts'],
    }),
  ],
})
```

**效果**：自动从 TSDoc 注释生成 API 文档！

### Vue 组件文档

```typescript
import { vueComponentPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  plugins: [
    vueComponentPlugin({
      include: 'src/components/**/*.vue',
    }),
  ],
})
```

**效果**：自动提取 Props、Events、Slots！

---

## 使用 Markdown 增强

### 容器

```markdown
::: tip 提示
这是一个提示
:::

::: warning 注意
这是一个警告
:::

::: danger 危险
这是一个危险警告
:::

::: details 点击展开
隐藏的内容
:::
```

### 代码块

````markdown
```typescript {2,4}
function example() {
  const a = 1  // 高亮
  const b = 2
  const c = 3  // 高亮
}
```

::: code-group

```ts [TypeScript]
const msg: string = 'Hello'
```

```js [JavaScript]
const msg = 'Hello'
```

:::
````

### Emoji

```markdown
支持 Emoji :tada: :rocket: :sparkles:
```

---

## 启用高级功能

### 1. 暗黑模式

```typescript
export default defineConfig({
  site: {
    darkMode: true, // 启用暗黑模式
  },
})
```

### 2. 国际化

```typescript
export default defineConfig({
  i18n: {
    defaultLocale: 'zh-CN',
    locales: {
      'zh-CN': { lang: 'zh-CN', label: '简体中文' },
      'en-US': { lang: 'en-US', label: 'English' },
    },
  },
})
```

### 3. 搜索

```typescript
import { algoliaPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  plugins: [
    algoliaPlugin({
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_API_KEY',
      indexName: 'docs',
    }),
  ],
})
```

### 4. PWA

```typescript
export default defineConfig({
  pwa: {
    enabled: true,
    name: '我的文档',
  },
})
```

### 5. 评论

```typescript
export default defineConfig({
  comments: {
    enabled: true,
    provider: 'giscus',
    giscus: {
      repo: 'owner/repo',
      repoId: 'xxx',
      category: 'General',
      categoryId: 'xxx',
    },
  },
})
```

---

## 构建和部署

### 构建

```bash
npx ldesign-docs build
```

### 预览

```bash
npx ldesign-docs serve
```

### 部署到 GitHub Pages

1. 创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: pnpm
      
      - run: pnpm install
      
      - run: pnpm docs:build
      
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. 更新 `package.json`：

```json
{
  "scripts": {
    "docs:dev": "ldesign-docs dev",
    "docs:build": "ldesign-docs build"
  }
}
```

3. 推送代码，GitHub Actions 会自动部署！

---

## 下一步

- [完整配置参考](./configuration.md)
- [Markdown 增强](./markdown.md)
- [主题开发](./theme-development.md)
- [插件开发](./plugin-development.md)
- [性能优化](./performance.md)

---

## 获取帮助

- [GitHub Issues](https://github.com/ldesign/ldesign/issues)
- [示例项目](../examples/)
- [API 参考](./api-reference.md)

