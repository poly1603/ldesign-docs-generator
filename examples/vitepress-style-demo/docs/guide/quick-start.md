---
title: 快速开始
description: 5分钟搭建文档站点
---

# 快速开始

## 前置要求

- Node.js 18+
- pnpm/npm/yarn

---

## 安装

::: code-group

```bash [pnpm]
pnpm add -D @ldesign/docs-generator@next
```

```bash [npm]
npm install -D @ldesign/docs-generator@next
```

```bash [yarn]
yarn add -D @ldesign/docs-generator@next
```

:::

---

## 初始化

```bash
npx ldesign-docs init
```

这将创建 `docs-generator.config.ts` 配置文件：

```typescript
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  sourceDir: './docs',
  outputDir: './dist',
  // ... 更多配置
})
```

---

## 项目结构

创建以下目录结构：

```
my-project/
├── docs/                    # 文档源文件
│   ├── index.md            # 首页
│   ├── guide/              # 指南
│   │   ├── introduction.md
│   │   └── quick-start.md
│   └── api/                # API 文档
├── src/                    # 源代码
│   ├── index.ts
│   └── components/
├── docs-generator.config.ts
└── package.json
```

---

## 创建首页

`docs/index.md`:

```markdown
---
layout: home
---

# 我的项目

这是首页内容。

::: tip
开始探索吧！
:::
```

---

## 配置导航

```typescript
export default defineConfig({
  navigation: {
    topbar: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/introduction' },
      { text: 'API', link: '/api/' },
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

## 启动开发服务器

```bash
npx ldesign-docs dev
```

访问 `http://localhost:3000` 查看你的文档站点！

::: tip HMR 支持
修改 Markdown 文件会立即看到更新，无需刷新页面！
:::

---

## 使用 Markdown 增强

### 容器

```markdown
::: tip 提示
这是提示内容
:::

::: warning 注意
这是警告内容
:::
```

### 代码块

````markdown
```typescript {2}
function hello() {
  console.log('Hello World')  // 高亮这行
}
```
````

### 代码组

````markdown
::: code-group

```ts [TypeScript]
const msg: string = 'Hello'
```

```js [JavaScript]
const msg = 'Hello'
```

:::
````

---

## 自动生成 API 文档

### 1. 添加 TypeDoc 插件

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

### 2. 在代码中添加注释

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

### 3. 运行生成

```bash
npx ldesign-docs generate
```

API 文档会自动生成到 `/api/` 路径！

---

## 自动生成组件文档

### 1. 添加 Vue 组件插件

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

### 2. 编写组件

```vue
<template>
  <button :class="type" :disabled="disabled" @click="handleClick">
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
  disabled: false,
})

const emit = defineEmits<{
  /** 点击事件 */
  (e: 'click', event: MouseEvent): void
}>()

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>
```

### 3. 生成文档

组件文档会自动生成，包括：
- ✅ Props 表格
- ✅ Events 列表
- ✅ Slots 说明
- ✅ 类型定义

---

## 构建生产版本

```bash
npx ldesign-docs build
```

生成的文件在 `dist/` 目录中。

---

## 预览构建产物

```bash
npx ldesign-docs serve
```

---

## 下一步

- [配置参考](../configuration.md) - 了解所有配置选项
- [Markdown 增强](./markdown.md) - 学习 Markdown 语法
- [主题定制](./theme.md) - 自定义主题
- [插件开发](./plugins.md) - 开发自己的插件

::: info 提示
遇到问题？查看 [常见问题](./faq.md) 或提交 [Issue](https://github.com/ldesign/ldesign/issues)
:::

