# 快速参考卡片

## 🚀 安装和初始化

```bash
# 安装
pnpm add -D @ldesign/docs-generator

# 初始化配置
npx ldesign-docs init

# 生成文档
npx ldesign-docs generate

# 预览
npx ldesign-docs serve --open
```

---

## 🔌 常用插件

### 解析器
```typescript
typedocPlugin({ tsconfig: './tsconfig.json' })
vueComponentPlugin({ include: '**/*.vue' })
reactComponentPlugin({ include: '**/*.{tsx,jsx}' })
markdownPlugin({ include: '**/*.md' })
```

### 增强
```typescript
mermaidPlugin({ theme: 'dark' })
katexPlugin({ inlineMath: true })
mediaPlugin({ lazyLoading: true, lightbox: true })
codeDiffPlugin({ style: 'split' })
```

### 交互
```typescript
playgroundPlugin({ frameworks: ['vue', 'react'] })
codesandboxPlugin()
stackblitzPlugin()
```

### 集成
```typescript
algoliaPlugin({
  appId: 'APP_ID',
  apiKey: 'API_KEY',
  indexName: 'docs',
})
```

---

## 🎨 主题选择

```typescript
theme: {
  name: 'modern',    // 现代化风格 ⭐ 推荐
  // name: 'minimal', // 极简风格
  // name: 'docs',    // VitePress 风格
  // name: 'api',     // API 文档专用
  // name: 'component', // 组件展示专用
}
```

---

## 🛠️ CLI 命令

```bash
# 生成文档
ldesign-docs generate
ldesign-docs gen              # 别名
ldesign-docs generate --watch # 监听模式

# 构建生产版本（包含优化）
ldesign-docs build

# 预览文档
ldesign-docs serve
ldesign-docs serve --port 8080 --open

# 初始化配置
ldesign-docs init
ldesign-docs init --force

# 清理输出
ldesign-docs clean

# 主题管理
ldesign-docs theme create <name>
ldesign-docs theme list
ldesign-docs theme validate <dir>
ldesign-docs theme build <dir>
```

---

## ⚙️ 常用配置

### 基础配置
```typescript
{
  sourceDir: './src',
  outputDir: './docs',
  cacheDir: '.cache/docs',
  logLevel: 'info', // silent|error|warn|info|debug
}
```

### 站点配置
```typescript
site: {
  title: '文档站点',
  description: '描述',
  lang: 'zh-CN',
  darkMode: true,
  logo: '/logo.svg',
  socialLinks: [
    { icon: 'github', link: 'https://github.com/...' },
  ],
}
```

### 导航配置
```typescript
navigation: {
  sidebar: 'auto', // 或自定义配置
  topbar: [
    { text: '首页', link: '/' },
    { text: 'API', link: '/api/' },
  ],
  breadcrumb: true,
  toc: true,
}
```

---

## 📝 文档编写

### TypeScript API
```typescript
/**
 * 函数描述
 * 
 * @param a - 参数描述
 * @returns 返回值描述
 * 
 * @example
 * ```ts
 * const result = myFunction(1)
 * ```
 */
export function myFunction(a: number): string {
  return String(a)
}
```

### Vue 组件
```vue
<script setup lang="ts">
/**
 * 组件描述
 */

interface Props {
  /** Prop 描述 */
  type?: 'primary' | 'default'
}

defineProps<Props>()

const emit = defineEmits<{
  /** 事件描述 */
  click: [event: MouseEvent]
}>()
</script>
```

### Markdown
```markdown
---
title: 页面标题
description: 页面描述
tags: [tag1, tag2]
---

# 标题

内容...

```mermaid
graph TD
  A-->B
\```

$$
E = mc^2
$$
\```
```

---

## 🔧 编程式 API

```typescript
import { DocsGenerator, vueComponentPlugin } from '@ldesign/docs-generator'

const generator = new DocsGenerator({
  sourceDir: './src',
  outputDir: './docs',
  plugins: [vueComponentPlugin()],
  site: { title: 'My Docs' },
})

await generator.generate()
await generator.build()
await generator.cleanup()
```

---

## 💡 提示

### 性能优化
- ✅ 增量解析默认启用
- ✅ 使用 `--watch` 监听变化
- ✅ 调整 `concurrency` 并发度
- ✅ 排除不必要的文件

### 调试
```bash
# 启用调试日志
npx ldesign-docs generate --log-level debug

# 清理缓存
rm -rf .cache/docs-generator
```

### 热重载
```bash
# 监听模式自动重载
npx ldesign-docs generate --watch
```

---

## 📚 快速链接

- 📘 [完整文档](./README.md)
- 🚀 [快速开始](./QUICK_START.md)
- 📖 [文档索引](./📖_DOCUMENTATION_INDEX.md)
- 🎉 [v2.0.0 新功能](./🎉_v2.0.0_COMPLETE.md)
- 🔌 [插件开发](./docs/plugin-development.md)
- 🎨 [主题开发](./docs/theme-development.md)
- 💡 [最佳实践](./docs/best-practices.md)

---

**保存此卡片以便快速查阅！** 📌


