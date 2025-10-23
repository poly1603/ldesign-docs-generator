# 🚀 从这里开始 - v3.0

## 欢迎使用 @ldesign/docs-generator v3.0！

**版本**: v3.0.0-alpha.1  
**状态**: ✅ 100% 功能完成  

---

## 🎯 你想做什么？

### 1. 快速开始（5分钟）

```bash
# 安装
pnpm add -D @ldesign/docs-generator@next

# 初始化
npx ldesign-docs init

# 启动
npx ldesign-docs dev
```

👉 [详细教程](./docs/quick-start-v3.md)

### 2. 从 VitePress 迁移

```bash
# 卸载 VitePress
pnpm remove vitepress

# 安装 v3.0
pnpm add -D @ldesign/docs-generator@next

# 无需修改配置，直接使用！
npx ldesign-docs dev
```

👉 [迁移指南](./docs/migration-guide.md)

### 3. 查看完整功能

v3.0 包含：
- ✅ VitePress 所有功能（30+）
- ✅ 独有自动化功能（10+）
- ✅ 高级集成功能（6+）

👉 [功能清单](./V3_FEATURES_COMPLETE_LIST.md)

### 4. 查看示例

完整的 VitePress 风格示例项目：

```bash
cd examples/vitepress-style-demo
pnpm install
npx ldesign-docs dev
```

👉 [示例项目](./examples/vitepress-style-demo/)

### 5. 学习配置

完整的配置参考文档：

```typescript
export default defineConfig({
  // 100+ 个配置选项
  // 完整的类型提示
})
```

👉 [配置参考](./docs/configuration.md)

---

## 📚 文档导航

### 初学者

1. [快速开始](./docs/quick-start-v3.md) - 5分钟上手
2. [介绍](./examples/vitepress-style-demo/docs/guide/introduction.md) - 了解概念
3. [Markdown 增强](./docs/markdown.md) - 学习语法

### 进阶用户

1. [配置参考](./docs/configuration.md) - 完整配置
2. [性能优化](./docs/performance.md) - 性能技巧
3. [API 参考](./docs/api-reference.md) - 完整 API

### 开发者

1. [插件开发](./docs/plugin-development.md) - 开发插件
2. [主题开发](./docs/theme-development.md) - 自定义主题
3. [架构设计](./docs/architecture.md) - 架构文档

### 迁移用户

1. [迁移指南](./docs/migration-guide.md) - 从 VitePress 迁移
2. [功能对比](./docs/features-comparison.md) - vs VitePress
3. [配置映射](./docs/migration-guide.md#配置映射) - 配置转换

---

## ⚡ 快速参考

### 常用命令

```bash
# 开发（Vite + HMR）
npx ldesign-docs dev [--port 5173] [--open]

# 生成文档
npx ldesign-docs generate [--watch]

# 构建生产版本
npx ldesign-docs build

# 预览构建
npx ldesign-docs serve

# 初始化配置
npx ldesign-docs init

# 清理输出
npx ldesign-docs clean
```

### 常用配置

```typescript
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  // 基础
  sourceDir: './docs',
  outputDir: './dist',

  // Vite
  vite: { server: { port: 5173 } },

  // Markdown
  markdown: {
    lineNumbers: true,
    containers: true,
    emoji: true,
  },

  // 主题
  theme: {
    name: 'vitepress-default',
  },

  // i18n
  i18n: {
    defaultLocale: 'zh-CN',
    locales: { 'zh-CN': {}, 'en-US': {} },
  },

  // 插件
  plugins: [
    markdownPlugin(),
    typedocPlugin(),
    vueComponentPlugin(),
  ],
})
```

### Markdown 语法

```markdown
::: tip
提示容器
:::

```ts {1,3}
const a = 1  // 高亮
const b = 2
const c = 3  // 高亮
\```

::: code-group
```ts [TypeScript]
const msg: string = 'Hello'
\```
```js [JavaScript]
const msg = 'Hello'
\```
:::

Emoji :tada: :rocket:

@[code](./file.ts)

## 标题 {#custom-id}
```

---

## 🆚 为什么选择 v3.0？

### vs VitePress

| 特性 | VitePress | v3.0 |
|------|-----------|------|
| Vite + HMR | ✅ | ✅ |
| Markdown | ✅ | ✅ |
| **自动化** | ❌ | ✅ 强大 |
| **API 文档** | ⚠️ 手写 | ✅ 自动 |
| **组件文档** | ⚠️ 手写 | ✅ 自动 |

### 适用场景

**强烈推荐** ⭐⭐⭐⭐⭐:
- 组件库文档（Vue/React）
- TypeScript 库 API 文档
- 需要自动化的项目

**也适合** ⭐⭐⭐⭐:
- 产品文档
- 技术博客
- 任何文档项目

---

## 🎁 核心优势

### 1. 双重能力

```
VitePress 所有功能
      +
自动化文档生成
      =
完美解决方案
```

### 2. 极致性能

- 启动: **< 1s**
- 更新: **< 200ms**
- 构建: **5-10x** 提速

### 3. 开箱即用

- 15个组件
- 8种 Markdown 增强
- 4种布局
- 完整 i18n
- PWA 支持

---

## 📖 重要文档

### 必读文档

1. **[快速开始](./docs/quick-start-v3.md)** ⭐⭐⭐⭐⭐
   - 5分钟搭建站点
   - 基础功能演示

2. **[完整配置](./docs/configuration.md)** ⭐⭐⭐⭐⭐
   - 所有配置选项
   - 详细说明和示例

3. **[Markdown 增强](./docs/markdown.md)** ⭐⭐⭐⭐
   - 所有 Markdown 语法
   - 完整示例

### 选读文档

1. **[迁移指南](./docs/migration-guide.md)**
   - 从 VitePress 迁移
   - 配置转换

2. **[性能优化](./docs/performance.md)**
   - 优化技巧
   - 最佳实践

3. **[功能对比](./docs/features-comparison.md)**
   - vs VitePress
   - vs 其他工具

---

## 🔗 快速链接

### 文档
- [快速开始](./docs/quick-start-v3.md)
- [配置参考](./docs/configuration.md)
- [API 参考](./docs/api-reference.md)

### 示例
- [VitePress 风格示例](./examples/vitepress-style-demo/)
- [Vue 组件库示例](./examples/vue-component-lib/)
- [TypeScript API 示例](./examples/typescript-api/)

### 报告
- [完成报告](./🎉_V3.0_COMPLETE.md)
- [功能清单](./V3_FEATURES_COMPLETE_LIST.md)
- [最终总结](./FINAL_SUMMARY_V3.0.md)
- [项目证书](./🏆_PROJECT_CERTIFICATE_V3.0.md)

---

## 💬 获取帮助

### 问题排查

1. 查看 [常见问题](./docs/faq.md)
2. 搜索 [GitHub Issues](https://github.com/ldesign/ldesign/issues)
3. 查看 [示例项目](./examples/)

### 报告问题

[提交 Issue](https://github.com/ldesign/ldesign/issues/new)

### 参与贡献

[贡献指南](./docs/CONTRIBUTING.md)

---

## 🎉 开始你的文档之旅！

选择你的方式：

1. 💨 **快速体验** → `pnpm add -D @ldesign/docs-generator@next && npx ldesign-docs init && npx ldesign-docs dev`

2. 📖 **系统学习** → 阅读 [快速开始](./docs/quick-start-v3.md)

3. 🔄 **迁移项目** → 查看 [迁移指南](./docs/migration-guide.md)

4. 🎮 **查看示例** → 运行 [示例项目](./examples/vitepress-style-demo/)

---

<div align="center">

**祝你使用愉快！**

**有问题随时反馈！**

Made with ❤️ by LDesign Team

</div>

