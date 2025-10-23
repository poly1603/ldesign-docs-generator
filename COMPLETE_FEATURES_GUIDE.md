# 完整功能使用指南

## 目录

1. [Vite 开发服务器](#vite-开发服务器)
2. [Markdown 增强](#markdown-增强)
3. [主题系统](#主题系统)
4. [国际化](#国际化)
5. [导航系统](#导航系统)
6. [构建优化](#构建优化)
7. [高级功能](#高级功能)

---

## Vite 开发服务器

### 基础使用

```bash
# 启动开发服务器
npx ldesign-docs dev

# 指定端口
npx ldesign-docs dev --port 5173

# 自动打开浏览器
npx ldesign-docs dev --open

# 启用 HTTPS
npx ldesign-docs dev --https
```

### 配置

```typescript
export default defineConfig({
  vite: {
    server: {
      port: 5173,
      open: true,
      https: false,
      strictPort: false,
      host: '0.0.0.0',
    },
  },
})
```

### 特性

- ⚡ 冷启动 < 1s
- 🔥 HMR 更新 < 200ms
- 🔄 配置热重载
- 🎨 Vue 组件热更新
- 🚨 友好的错误页面

---

## Markdown 增强

### 1. 容器语法

#### Tip 容器

```markdown
::: tip 提示
这是一个提示容器
:::

::: tip 自定义标题
可以自定义标题
:::
```

#### Warning 容器

```markdown
::: warning 注意
这是一个警告容器
:::
```

#### Danger 容器

```markdown
::: danger 危险
这是一个危险警告容器
:::
```

#### Details 容器

```markdown
::: details 点击展开
这是可折叠的详细内容
:::
```

#### Info 容器

```markdown
::: info 信息
这是一个信息容器
:::
```

#### 自定义容器

```markdown
::: my-custom 自定义容器
这是一个自定义容器
:::
```

配置：

```typescript
markdown: {
  containersConfig: {
    custom: {
      'my-custom': {
        title: '自定义',
        className: 'my-custom-class',
      },
    },
  },
}
```

### 2. 代码块增强

#### 行号显示

默认启用，所有代码块自动显示行号：

````markdown
```typescript
function hello() {
  console.log('Hello')
}
```
````

禁用行号：

````markdown
```typescript:no-line-numbers
function hello() {
  console.log('Hello')
}
```
````

配置：

```typescript
markdown: {
  lineNumbers: true, // false 禁用
}
```

#### 代码行高亮

高亮特定行：

````markdown
```typescript {2,4-6}
function example() {
  const a = 1  // 高亮
  const b = 2
  const c = 3  // 高亮
  const d = 4  // 高亮
  const e = 5  // 高亮
}
```
````

#### 代码组（Tab 切换）

````markdown
::: code-group

```typescript [TypeScript]
const msg: string = 'Hello'
```

```javascript [JavaScript]
const msg = 'Hello'
```

```python [Python]
msg = 'Hello'
```

:::
````

使用自定义标题：

````markdown
::: code-group

```ts title="推荐配置"
export default { /* ... */ }
```

```ts title="最小配置"
export default { /* ... */ }
```

:::
````

### 3. Emoji 支持

```markdown
:tada: :rocket: :sparkles: :fire: :bug: :wrench:
```

效果：🎉 🚀 ✨ 🔥 🐛 🔧

配置：

```typescript
markdown: {
  emoji: true,
}
```

### 4. 锚点

#### 自动锚点

所有标题自动生成锚点：

```markdown
## 我的标题

链接：[跳转](#我的标题)
```

#### 自定义锚点

```markdown
## 我的标题 {#custom-id}

链接：[跳转](#custom-id)
```

配置：

```typescript
markdown: {
  anchor: true,
}
```

### 5. 代码导入

#### 导入整个文件

```markdown
@[code](./example.ts)
```

#### 导入指定行

```markdown
@[code{1-10}](./example.ts)
```

#### 导入单行

```markdown
@[code{5}](./example.ts)
```

### 6. 外部链接

外部链接自动添加图标和 `target="_blank"`：

```markdown
[GitHub](https://github.com)
[Vue.js](https://vuejs.org)
```

---

## 主题系统

### 使用 VitePress 默认主题

```typescript
export default defineConfig({
  theme: {
    name: 'vitepress-default',
  },
})
```

### 布局

#### Home 布局（首页）

```markdown
---
layout: home
---

# 欢迎

这是首页内容
```

#### Doc 布局（文档页）

```markdown
---
layout: doc
title: 文档页面
---

# 文档内容
```

#### Page 布局（自定义页）

```markdown
---
layout: page
---

# 自定义页面
```

### 自定义样式

```typescript
theme: {
  name: 'vitepress-default',
  styles: {
    primaryColor: '#42b983',
    backgroundColor: '#ffffff',
    textColor: '#213547',
  },
}
```

### 组件

主题包含 15 个组件：

- **Navbar** - 导航栏
- **Sidebar** - 侧边栏
- **TOC** - 目录
- **Footer** - 页脚
- **ThemeToggle** - 主题切换
- **LanguageSwitcher** - 语言切换
- **DocFooter** - 文档页脚
- **EditLink** - 编辑链接
- **LastUpdated** - 最后更新
- **Contributors** - 贡献者
- **Comments** - 评论
- **Feedback** - 反馈
- **BackToTop** - 返回顶部
- **MobileMenu** - 移动端菜单
- **SidebarGroup** - 侧边栏组

---

## 国际化

### 配置多语言

```typescript
export default defineConfig({
  i18n: {
    defaultLocale: 'zh-CN',
    locales: {
      'zh-CN': {
        lang: 'zh-CN',
        label: '简体中文',
        selectText: '选择语言',
      },
      'en-US': {
        lang: 'en-US',
        label: 'English',
        selectText: 'Languages',
      },
    },
  },
})
```

### 组织多语言文档

```
docs/
├── zh-CN/
│   ├── index.md
│   └── guide/
│       └── quick-start.md
└── en-US/
    ├── index.md
    └── guide/
        └── quick-start.md
```

### 使用语言切换器

语言切换器会自动显示在导航栏，无需额外配置。

---

## 导航系统

### 配置顶部导航

```typescript
navigation: {
  topbar: [
    { text: '首页', link: '/' },
    { text: '指南', link: '/guide/' },
    {
      text: 'API',
      items: [
        { text: '核心 API', link: '/api/core' },
        { text: '工具 API', link: '/api/utils' },
      ],
    },
  ],
}
```

### 配置侧边栏

#### 单个侧边栏

```typescript
navigation: {
  sidebar: [
    {
      text: '开始',
      items: [
        { text: '介绍', link: '/guide/introduction' },
        { text: '快速开始', link: '/guide/quick-start' },
      ],
    },
  ],
}
```

#### 多个侧边栏（按路径）

```typescript
navigation: {
  sidebar: {
    '/guide/': [
      // 指南的侧边栏
    ],
    '/api/': [
      // API 的侧边栏
    ],
  },
}
```

#### 自动生成侧边栏

```typescript
navigation: {
  sidebar: 'auto', // 根据文件结构自动生成
}
```

### 配置编辑链接

```typescript
navigation: {
  editLink: {
    pattern: 'https://github.com/owner/repo/edit/main/:path',
    text: '在 GitHub 上编辑此页',
  },
}
```

### 启用最后更新时间

```typescript
navigation: {
  lastUpdated: {
    enabled: true,
    fromGit: true, // 从 Git 提取
  },
}
```

---

## 构建优化

### 代码分割

```typescript
build: {
  codeSplit: {
    enabled: true,
    splitVendor: true, // 分离 node_modules
    chunkSizeThreshold: 500, // KB
  },
}
```

### 图片优化

```typescript
build: {
  imageOptimization: {
    enabled: true,
    convertToWebP: true, // 转换为 WebP
    quality: 80, // 压缩质量 0-100
  },
}
```

### 预加载/预取

```typescript
build: {
  prefetch: {
    enabled: true,
    strategy: 'lazy', // 'eager' | 'lazy' | 'viewport'
  },
}
```

**策略说明**:
- `eager`: 立即预取所有链接
- `lazy`: 鼠标悬停时预取（推荐）
- `viewport`: 进入视口时预取

### Critical CSS

```typescript
build: {
  criticalCss: {
    enabled: true,
    inline: true, // 内联到 HTML
    minify: true, // 压缩
  },
}
```

---

## 高级功能

### PWA 支持

```typescript
pwa: {
  enabled: true,
  name: '我的文档',
  shortName: 'Docs',
  themeColor: '#42b983',
  backgroundColor: '#ffffff',
  serviceWorker: {
    enabled: true,
    cacheStrategy: 'networkFirst',
  },
}
```

**效果**:
- 可安装为应用
- 离线访问
- 更快的加载

### 评论系统（Giscus）

#### 1. 在 GitHub 仓库中启用 Discussions

#### 2. 获取配置信息

访问 [giscus.app](https://giscus.app/)，填写信息获取配置。

#### 3. 添加配置

```typescript
comments: {
  enabled: true,
  provider: 'giscus',
  giscus: {
    repo: 'owner/repo',
    repoId: 'R_xxxxx',
    category: 'General',
    categoryId: 'DIC_xxxxx',
  },
}
```

#### 4. 在 Markdown 中启用

```markdown
---
comments: true
---

# 我的文章

内容...
```

评论区会自动显示在页面底部。

### Google Analytics

```typescript
analytics: {
  enabled: true,
  google: {
    measurementId: 'G-XXXXXXXXXX',
    enhancedMeasurement: true,
  },
}
```

### 百度统计

```typescript
analytics: {
  enabled: true,
  baidu: {
    siteId: 'your_site_id',
  },
}
```

### 反馈按钮

默认启用，在文档页面底部显示：

```markdown
---
feedback: true  # 默认为 true
---
```

禁用：

```markdown
---
feedback: false
---
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
      includePrivate: false,
    }),
  ],
})
```

在代码中添加注释：

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
 * add(5, 3) // 8
 * ```
 * 
 * @see {@link multiply} 相关函数
 */
export function add(a: number, b: number): number {
  return a + b
}
```

### Vue 组件文档

```typescript
import { vueComponentPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  plugins: [
    vueComponentPlugin({
      include: 'src/components/**/*.vue',
      exclude: '**/node_modules/**',
    }),
  ],
})
```

在组件中添加注释：

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
  type?: 'default' | 'primary' | 'danger'
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
})

const emit = defineEmits<{
  /** 点击事件 */
  (e: 'click', event: MouseEvent): void
  /** 双击事件 */
  (e: 'dblclick', event: MouseEvent): void
}>()

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>
```

### React 组件文档

```typescript
import { reactComponentPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  plugins: [
    reactComponentPlugin({
      include: 'src/components/**/*.{tsx,jsx}',
    }),
  ],
})
```

### Playground

```typescript
import { playgroundPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  plugins: [
    playgroundPlugin({
      frameworks: ['vue', 'react'],
      editorTheme: 'vs-dark',
    }),
  ],
})
```

在 Markdown 中使用：

```markdown
<Playground>
  <template>
    <Button type="primary">点击我</Button>
  </template>
</Playground>
```

---

## 完整配置示例

```typescript
import { defineConfig } from '@ldesign/docs-generator'
import {
  markdownPlugin,
  typedocPlugin,
  vueComponentPlugin,
  playgroundPlugin,
  mermaidPlugin,
  algoliaPlugin,
} from '@ldesign/docs-generator'

export default defineConfig({
  // ===== 基础配置 =====
  sourceDir: './docs',
  outputDir: './dist',
  cacheDir: '.cache/docs',
  logLevel: 'info',

  // ===== Vite 配置 =====
  vite: {
    server: {
      port: 5173,
      open: true,
      https: false,
    },
    build: {
      outDir: './dist',
      minify: 'terser',
      sourcemap: false,
    },
  },

  // ===== Markdown 配置 =====
  markdown: {
    lineNumbers: true,
    containers: true,
    emoji: true,
    anchor: true,
    theme: 'dark-plus',
  },

  // ===== 站点配置 =====
  site: {
    title: '我的文档',
    description: '强大的文档站点',
    lang: 'zh-CN',
    logo: '/logo.svg',
    darkMode: true,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/owner/repo' },
      { icon: 'twitter', link: 'https://twitter.com/handle' },
    ],
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2025',
    },
  },

  // ===== 导航配置 =====
  navigation: {
    topbar: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      {
        text: 'API',
        items: [
          { text: '核心', link: '/api/core' },
          { text: '工具', link: '/api/utils' },
        ],
      },
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
      '/api/': 'auto',
    },
    breadcrumb: true,
    toc: true,
    editLink: {
      pattern: 'https://github.com/owner/repo/edit/main/:path',
      text: '在 GitHub 上编辑此页',
    },
  },

  // ===== 主题配置 =====
  theme: {
    name: 'vitepress-default',
    styles: {
      primaryColor: '#42b983',
    },
  },

  // ===== 国际化配置 =====
  i18n: {
    defaultLocale: 'zh-CN',
    locales: {
      'zh-CN': {
        lang: 'zh-CN',
        label: '简体中文',
      },
      'en-US': {
        lang: 'en-US',
        label: 'English',
      },
    },
  },

  // ===== 插件配置 =====
  plugins: [
    // Markdown
    markdownPlugin(),

    // API 文档
    typedocPlugin({
      tsconfig: './tsconfig.json',
      entryPoints: ['./src/index.ts'],
    }),

    // 组件文档
    vueComponentPlugin({
      include: 'src/components/**/*.vue',
    }),

    // Playground
    playgroundPlugin({
      frameworks: ['vue'],
    }),

    // Mermaid 图表
    mermaidPlugin({
      theme: 'default',
    }),

    // 搜索
    algoliaPlugin({
      appId: process.env.ALGOLIA_APP_ID,
      apiKey: process.env.ALGOLIA_API_KEY,
      indexName: 'docs',
    }),
  ],

  // ===== 构建优化 =====
  build: {
    codeSplit: {
      enabled: true,
      splitVendor: true,
    },
    imageOptimization: {
      enabled: true,
      convertToWebP: true,
      quality: 80,
    },
    prefetch: {
      enabled: true,
      strategy: 'lazy',
    },
    criticalCss: {
      enabled: true,
      inline: true,
    },
  },

  // ===== PWA 配置 =====
  pwa: {
    enabled: true,
    name: '我的文档',
    shortName: 'Docs',
    themeColor: '#42b983',
    backgroundColor: '#ffffff',
    serviceWorker: {
      enabled: true,
      cacheStrategy: 'networkFirst',
    },
  },

  // ===== 评论配置 =====
  comments: {
    enabled: true,
    provider: 'giscus',
    giscus: {
      repo: 'owner/repo',
      repoId: 'R_xxxxx',
      category: 'General',
      categoryId: 'DIC_xxxxx',
    },
  },

  // ===== 分析配置 =====
  analytics: {
    enabled: true,
    google: {
      measurementId: 'G-XXXXXXXXXX',
    },
    baidu: {
      siteId: 'your_site_id',
    },
  },
})
```

---

## 最佳实践

### 1. 项目结构

```
my-project/
├── docs/                      # 文档源文件
│   ├── .vitepress/           # VitePress 兼容
│   ├── index.md              # 首页
│   ├── guide/                # 指南
│   └── api/                  # API（自动生成）
├── src/                      # 源代码
│   ├── index.ts
│   └── components/
├── docs-generator.config.ts  # 配置文件
├── package.json
└── README.md
```

### 2. 文件命名

- 使用小写字母和连字符：`quick-start.md`
- 避免特殊字符：`~/!@#$%^&*()`
- 使用有意义的名称：`introduction.md` 而不是 `intro.md`

### 3. Frontmatter

```markdown
---
title: 页面标题
description: 页面描述
layout: doc
author: 作者
date: 2025-10-23
tags: [vue, typescript]
---
```

### 4. 目录结构

使用清晰的目录层级：

```
guide/
  ├── index.md
  ├── getting-started/
  │   ├── installation.md
  │   └── quick-start.md
  └── advanced/
      ├── plugins.md
      └── themes.md
```

---

## 故障排除

### 问题 1：开发服务器启动失败

**可能原因**:
- 端口被占用
- 配置文件错误
- 依赖未安装

**解决方法**:
```bash
# 更换端口
npx ldesign-docs dev --port 5174

# 检查配置
npx ldesign-docs init --force

# 重新安装依赖
pnpm install
```

### 问题 2：HMR 不工作

**可能原因**:
- 使用了 `serve` 命令而非 `dev`
- 文件在监听范围外

**解决方法**:
```bash
# 使用 dev 命令
npx ldesign-docs dev

# 检查文件是否在 sourceDir 中
```

### 问题 3：样式不生效

**可能原因**:
- 主题配置错误
- CSS 文件未找到

**解决方法**:
```typescript
theme: {
  name: 'vitepress-default', // 确保主题名称正确
}
```

---

## 下一步

- [查看完整文档](./docs/)
- [查看示例项目](./examples/)
- [报告问题](https://github.com/ldesign/ldesign/issues)
- [参与贡献](./docs/CONTRIBUTING.md)

---

**最后更新**: 2025-10-23  
**版本**: v3.0.0-alpha.1

