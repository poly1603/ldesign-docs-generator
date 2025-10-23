---
layout: home
title: 首页
---

# VitePress 风格示例 :tada:

欢迎来到 @ldesign/docs-generator v3.0 的 VitePress 风格示例站点！

::: tip 重大更新
v3.0 包含了 VitePress 的所有核心功能，同时保留了强大的自动化文档生成能力！
:::

## 主要特性

### ⚡ Vite 驱动

使用 Vite 驱动的开发服务器，享受极速的热模块替换（HMR）。

```bash
npx ldesign-docs dev
```

### 🎨 Markdown 增强

完整的 Markdown 增强功能：

::: code-group

```typescript [容器]
::: tip
这是提示
:::

::: warning
这是警告
:::
```

```typescript [代码块]
```ts {1,3}
const a = 1  // 高亮
const b = 2
const c = 3  // 高亮
\```
```

:::

### 🤖 自动化文档

自动从代码生成文档：

```typescript
// 配置 TypeDoc 插件
typedocPlugin({
  entryPoints: ['./src/index.ts']
})

// 配置 Vue 组件插件
vueComponentPlugin({
  include: 'src/components/**/*.vue'
})
```

**效果**：
- ✅ API 文档自动生成
- ✅ Props/Events 自动提取
- ✅ 类型定义自动文档化

### 🎮 交互式 Playground

内置代码编辑器和实时预览：

```vue
<Playground>
  <Button type="primary">点击我</Button>
</Playground>
```

### 🌍 国际化

完整的多语言支持：

- 🇨🇳 简体中文
- 🇺🇸 English
- 🇯🇵 日本語（可扩展）

### 🚀 性能优化

- 代码分割（路由级）
- 图片优化（WebP）
- 预加载/预取
- PWA 支持

---

## 与 VitePress 对比

| 功能 | VitePress | v3.0 |
|------|-----------|------|
| Vite + HMR | ✅ | ✅ |
| Markdown 增强 | ✅ | ✅ |
| 默认主题 | ✅ | ✅ |
| 暗黑模式 | ✅ | ✅ |
| i18n | ✅ | ✅ |
| **API 自动生成** | ❌ | ✅ |
| **组件文档自动提取** | ❌ | ✅ |
| **Playground** | ❌ | ✅ |
| **插件系统** | 基础 | 企业级 |

---

## 快速链接

- [指南](/guide/introduction)
- [API 参考](/api/core)
- [组件](/components/)
- [示例](/examples/)

---

::: info 开源项目
本项目基于 MIT 许可开源，欢迎贡献！
:::

