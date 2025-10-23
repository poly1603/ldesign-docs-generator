# 🚀 快速开始指南

## 5 分钟上手 @ldesign/docs-generator

### 步骤 1: 安装

```bash
# 使用 pnpm
pnpm add -D @ldesign/docs-generator

# 使用 npm
npm install -D @ldesign/docs-generator

# 使用 yarn
yarn add -D @ldesign/docs-generator
```

### 步骤 2: 初始化配置

```bash
npx ldesign-docs init
```

这将创建一个 `docs-generator.config.js` 配置文件。

### 步骤 3: 编辑配置

打开 `docs-generator.config.js`，根据你的项目修改：

```javascript
import { defineConfig } from '@ldesign/docs-generator'
import { typedocPlugin, vueComponentPlugin, markdownPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  // 源代码目录
  sourceDir: './src',
  
  // 输出目录
  outputDir: './docs',
  
  // 插件配置
  plugins: [
    // TypeScript API 文档
    typedocPlugin({
      tsconfig: './tsconfig.json',
    }),
    
    // Vue 组件文档
    vueComponentPlugin({
      include: '**/*.vue',
    }),
    
    // Markdown 文档
    markdownPlugin({
      include: '**/*.md',
    }),
  ],
  
  // 站点配置
  site: {
    title: '我的项目文档',
    description: '项目文档说明',
  },
})
```

### 步骤 4: 生成文档

```bash
# 生成文档
npx ldesign-docs generate

# 或使用简写
npx ldesign-docs gen
```

### 步骤 5: 查看文档

```bash
# 启动预览服务器
npx ldesign-docs serve

# 浏览器访问
# http://localhost:3000
```

---

## 💡 常见场景

### 场景 1: 只生成 TypeScript API 文档

```javascript
export default defineConfig({
  sourceDir: './src',
  outputDir: './docs',
  
  plugins: [
    typedocPlugin({
      tsconfig: './tsconfig.json',
      entryPoints: ['./src/index.ts'],
    }),
  ],
  
  site: {
    title: 'API 文档',
  },
})
```

### 场景 2: Vue 组件库文档

```javascript
export default defineConfig({
  sourceDir: './src/components',
  outputDir: './docs',
  
  plugins: [
    vueComponentPlugin({
      include: '**/*.vue',
    }),
  ],
  
  site: {
    title: '组件库文档',
  },
})
```

### 场景 3: 混合文档（API + 组件 + Markdown）

```javascript
export default defineConfig({
  sourceDir: './src',
  outputDir: './docs',
  
  plugins: [
    typedocPlugin(),
    vueComponentPlugin(),
    markdownPlugin(),
  ],
  
  site: {
    title: '完整文档',
  },
})
```

---

## 🎨 自定义主题

```javascript
export default defineConfig({
  // ...其他配置
  
  theme: {
    name: 'default',
    styles: {
      primaryColor: '#3498db',    // 主色调
      backgroundColor: '#ffffff',  // 背景色
      textColor: '#333333',       // 文字颜色
    },
  },
})
```

---

## 🧭 自定义导航

```javascript
export default defineConfig({
  // ...其他配置
  
  navigation: {
    // 自动生成侧边栏
    sidebar: 'auto',
    
    // 顶部导航
    topbar: [
      { text: '首页', link: '/' },
      { text: 'API', link: '/api/' },
      { text: '组件', link: '/components/' },
      { text: 'GitHub', link: 'https://github.com/your/repo' },
    ],
  },
})
```

---

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
 */

interface Props {
  /** 按钮类型 */
  type?: 'primary' | 'default'
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

---

## 🛠️ 常用命令

```bash
# 生成文档
ldesign-docs generate
ldesign-docs gen

# 构建生产版本
ldesign-docs build

# 预览文档
ldesign-docs serve -p 3000

# 初始化配置
ldesign-docs init

# 清理输出目录
ldesign-docs clean
```

---

## ❓ 常见问题

### Q: 如何只生成特定文件的文档？

A: 使用 `include` 和 `exclude` 选项：

```javascript
typedocPlugin({
  entryPoints: ['./src/core/index.ts'],
})
```

### Q: 如何自定义输出路径？

A: 修改 `outputDir` 配置：

```javascript
export default defineConfig({
  outputDir: './my-docs',
})
```

### Q: 如何在 package.json 中添加脚本？

A: 

```json
{
  "scripts": {
    "docs:generate": "ldesign-docs generate",
    "docs:serve": "ldesign-docs serve",
    "docs:build": "ldesign-docs build"
  }
}
```

---

## 📚 更多资源

- [完整文档](./README.md)
- [配置示例](./docs-generator.config.example.ts)
- [更新日志](./CHANGELOG.md)
- [实施总结](./IMPLEMENTATION_SUMMARY.md)

---

**就是这么简单！** 🎉

现在你已经知道如何使用 @ldesign/docs-generator 生成文档了。

有任何问题，请查看完整文档或提交 Issue。




