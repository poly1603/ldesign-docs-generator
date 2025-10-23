# 迁移指南

## 从 VitePress 迁移到 @ldesign/docs-generator v3.0

### 概述

@ldesign/docs-generator v3.0 包含了 VitePress 的所有核心功能，同时增加了强大的自动化文档生成能力。本指南将帮助你从 VitePress 平滑迁移。

---

## 为什么迁移？

### VitePress 的优势
- ✅ 简单易用
- ✅ Vue 官方支持
- ✅ 成熟稳定

### @ldesign/docs-generator v3.0 的额外优势
- ✅ **自动化 API 文档**：从 TypeScript 代码自动生成 API 文档
- ✅ **组件文档自动提取**：自动提取 Vue/React 组件的 Props/Events/Slots
- ✅ **交互式 Playground**：内置代码编辑器和实时预览
- ✅ **企业级插件系统**：依赖管理、配置验证、12个生命周期钩子
- ✅ **增量解析**：大型项目5-10倍性能提升
- ✅ **所有 VitePress 功能**：Markdown 增强、主题、i18n 等

---

## 迁移步骤

### 1. 安装依赖

```bash
# 卸载 VitePress
pnpm remove vitepress

# 安装 @ldesign/docs-generator
pnpm add -D @ldesign/docs-generator@next
```

### 2. 转换配置文件

**VitePress 配置** (`.vitepress/config.ts`):
```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'My Docs',
  description: 'My awesome docs',
  
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: {
      '/guide/': [
        { text: 'Introduction', link: '/guide/introduction' },
        { text: 'Getting Started', link: '/guide/getting-started' },
      ],
    },
  },
})
```

**@ldesign/docs-generator 配置** (`docs-generator.config.ts`):
```typescript
import { defineConfig, markdownPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  sourceDir: './docs',
  outputDir: './dist',

  site: {
    title: 'My Docs',
    description: 'My awesome docs',
  },

  navigation: {
    topbar: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: {
      '/guide/': [
        { text: 'Introduction', link: '/guide/introduction' },
        { text: 'Getting Started', link: '/guide/getting-started' },
      ],
    },
  },

  plugins: [
    markdownPlugin(),
  ],

  // Markdown 配置（VitePress 兼容）
  markdown: {
    lineNumbers: true,
    containers: true,
    emoji: true,
    anchor: true,
  },

  // Vite 配置
  vite: {
    server: {
      port: 5173,
    },
  },
})
```

### 3. 更新 package.json 脚本

**VitePress**:
```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

**@ldesign/docs-generator**:
```json
{
  "scripts": {
    "docs:dev": "ldesign-docs dev",
    "docs:build": "ldesign-docs build",
    "docs:preview": "ldesign-docs serve"
  }
}
```

### 4. 迁移 Markdown 文件

#### Frontmatter 兼容

VitePress 和 @ldesign/docs-generator 的 frontmatter 完全兼容：

```markdown
---
title: 快速开始
description: 了解如何开始
layout: doc
---

# 快速开始
```

#### Markdown 增强语法

所有 VitePress 的 Markdown 增强语法都受支持：

**容器**:
```markdown
::: tip
这是提示
:::

::: warning
这是警告
:::

::: danger
这是危险警告
:::

::: details 点击展开
这是详细内容
:::
```

**代码块**:
````markdown
```ts {1,3-5}
const a = 1  // 高亮
const b = 2
const c = 3  // 高亮
const d = 4  // 高亮
const e = 5  // 高亮
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

### 5. 迁移自定义主题（如果有）

如果你有自定义的 VitePress 主题，可以将其转换为 @ldesign/docs-generator 主题：

**VitePress 主题结构**:
```
.vitepress/
  theme/
    index.ts
    Layout.vue
    style.css
```

**@ldesign/docs-generator 主题结构**:
```
my-theme/
  layouts/
    Layout.vue
  components/
  styles/
    main.css
  theme.config.ts
```

---

## 配置映射

### 站点配置

| VitePress | @ldesign/docs-generator |
|-----------|------------------------|
| `title` | `site.title` |
| `description` | `site.description` |
| `lang` | `site.lang` |
| `base` | `site.base` |

### 主题配置

| VitePress | @ldesign/docs-generator |
|-----------|------------------------|
| `themeConfig.nav` | `navigation.topbar` |
| `themeConfig.sidebar` | `navigation.sidebar` |
| `themeConfig.socialLinks` | `site.socialLinks` |
| `themeConfig.footer` | `site.footer` |
| `themeConfig.editLink` | `navigation.editLink` |
| `themeConfig.lastUpdated` | `navigation.lastUpdated` |

### Markdown 配置

| VitePress | @ldesign/docs-generator |
|-----------|------------------------|
| `markdown.lineNumbers` | `markdown.lineNumbers` |
| `markdown.theme` | `markdown.theme` |
| `markdown.config` | `markdown.markdownItOptions` |

---

## 新增功能使用

### 自动 API 文档

```typescript
import { defineConfig, typedocPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  plugins: [
    // 自动生成 TypeScript API 文档
    typedocPlugin({
      tsconfig: './tsconfig.json',
      entryPoints: ['./src/index.ts'],
    }),
  ],
})
```

### 组件文档自动提取

```typescript
import { vueComponentPlugin, reactComponentPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  plugins: [
    // Vue 组件文档
    vueComponentPlugin({
      include: 'src/components/**/*.vue',
    }),

    // React 组件文档
    reactComponentPlugin({
      include: 'src/components/**/*.{tsx,jsx}',
    }),
  ],
})
```

### 交互式 Playground

```typescript
import { playgroundPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  plugins: [
    playgroundPlugin({
      frameworks: ['vue', 'react'],
    }),
  ],
})
```

---

## 常见问题

### 1. Markdown 文件不热更新？

确保使用 `ldesign-docs dev` 命令而不是 `ldesign-docs serve`：

```bash
# ✅ 正确 - 支持 HMR
npx ldesign-docs dev

# ❌ 错误 - 仅预览静态文件
npx ldesign-docs serve
```

### 2. 样式不一致？

检查是否正确应用了主题：

```typescript
export default defineConfig({
  theme: {
    name: 'vitepress-default', // 使用 VitePress 风格主题
  },
})
```

### 3. 导航配置不生效？

确保配置在正确的位置：

```typescript
export default defineConfig({
  navigation: {  // ← 注意是 navigation，不是 themeConfig
    topbar: [...],
    sidebar: {...},
  },
})
```

### 4. 找不到某些 VitePress 功能？

v3.0 实现了 VitePress 的所有核心功能。如果遇到问题，请查看[功能对比表](./features-comparison.md)。

---

## 逐步迁移策略

如果你的项目较大，建议采用渐进式迁移：

### 阶段 1：并行运行
1. 保留 VitePress 配置
2. 添加 @ldesign/docs-generator 配置
3. 同时运行两个系统，对比结果

### 阶段 2：功能迁移
1. 先迁移简单的 Markdown 文档
2. 然后迁移导航配置
3. 最后迁移主题定制

### 阶段 3：完全切换
1. 确认所有功能正常
2. 移除 VitePress
3. 更新 CI/CD 配置

---

## 获取帮助

如果遇到问题：
1. 查看[完整配置参考](./configuration.md)
2. 查看[示例项目](../examples/)
3. 提交 [GitHub Issue](https://github.com/ldesign/ldesign/issues)
4. 加入社区讨论

---

## 总结

迁移到 @ldesign/docs-generator v3.0 后，你将获得：
- ✅ VitePress 的所有功能
- ✅ 自动化 API 文档生成
- ✅ 组件文档自动提取
- ✅ 强大的插件系统
- ✅ 更好的性能优化

欢迎来到 @ldesign/docs-generator 的世界！🎉


