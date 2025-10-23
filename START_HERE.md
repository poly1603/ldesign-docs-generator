# 🎯 从这里开始！

## 👋 欢迎使用 @ldesign/docs-generator v2.0.0

这是一个**企业级智能文档生成器**，帮助你自动生成API文档、组件文档和文档站点。

---

## ⚡ 3 分钟快速开始

### 1. 安装
```bash
pnpm add -D @ldesign/docs-generator
```

### 2. 初始化
```bash
npx ldesign-docs init
```

### 3. 生成文档
```bash
npx ldesign-docs generate
npx ldesign-docs serve --open
```

**就这么简单！** ✨

---

## 🎨 v2.0.0 新功能速览

### 🚀 性能提升
- **增量解析**: 5-10 倍提速
- **并行处理**: 4 并发
- **智能缓存**: 三级缓存

### 🎨 5 个新主题
```bash
# 选择主题
theme: {
  name: 'modern',  # 或 minimal, docs, api, component
}
```

### 🎮 交互式 Playground
```typescript
plugins: [
  playgroundPlugin({ frameworks: ['vue'] })
]
```

### 📊 图表和公式
```typescript
plugins: [
  mermaidPlugin(),  # Mermaid 图表
  katexPlugin(),    # 数学公式
]
```

### 🔍 强大搜索
- 本地快速搜索
- Algolia 云搜索
- 结果高亮

### 🚀 代码运行
```typescript
plugins: [
  codesandboxPlugin(),  # CodeSandbox
  stackblitzPlugin(),   # StackBlitz
  codepenPlugin(),      # CodePen
]
```

---

## 📚 下一步

### 🎯 根据你的需求选择：

#### 我想生成 Vue 组件文档
1. 查看示例: [examples/vue-component-lib/](./examples/vue-component-lib/)
2. 使用插件: `vueComponentPlugin()`
3. 推荐主题: `component`

#### 我想生成 React 组件文档
1. 查看示例: [examples/react-component-lib/](./examples/react-component-lib/)
2. 使用插件: `reactComponentPlugin()`
3. 推荐主题: `component`

#### 我想生成 TypeScript API 文档
1. 查看示例: [examples/typescript-api/](./examples/typescript-api/)
2. 使用插件: `typedocPlugin()`
3. 推荐主题: `api`

#### 我想开发自定义插件
1. 阅读: [docs/plugin-development.md](./docs/plugin-development.md)
2. 参考: [examples/custom-plugin/](./examples/custom-plugin/)

#### 我想定制主题
1. 阅读: [docs/theme-development.md](./docs/theme-development.md)
2. 创建: `npx ldesign-docs theme create my-theme`

---

## 📖 完整文档导航

所有文档都在这里：[📖_DOCUMENTATION_INDEX.md](./📖_DOCUMENTATION_INDEX.md)

### 核心文档
- 📘 [README.md](./README.md) - 主文档
- 📗 [QUICK_START.md](./QUICK_START.md) - 快速开始
- 📙 [🎉_v2.0.0_COMPLETE.md](./🎉_v2.0.0_COMPLETE.md) - v2.0.0 新功能

### 开发指南
- 🔌 [插件开发指南](./docs/plugin-development.md)
- 🎨 [主题开发指南](./docs/theme-development.md)
- 🏗️ [架构设计文档](./docs/architecture.md)
- 🤝 [贡献指南](./docs/CONTRIBUTING.md)

### 参考文档
- 📚 [API 参考](./docs/API_REFERENCE.md)
- 💡 [最佳实践](./docs/best-practices.md)

---

## 🎁 功能亮点

### ⭐ 15+ 个强大插件
- TypeDoc、Vue、React、Markdown（解析器）
- Mermaid、KaTeX、Media、CodeDiff（增强）
- Algolia、CodeSandbox、StackBlitz、CodePen（集成）
- Playground、Controls（交互）

### ⭐ 6 个精美主题
- **default** - 经典默认
- **modern** - 现代时尚 ✨ 推荐
- **minimal** - 极简优雅
- **docs** - VitePress 风格
- **api** - API 文档专用
- **component** - 组件展示专用

### ⭐ 企业级性能
- 增量解析提速 **5-10 倍**
- 多进程并行处理
- 三级缓存系统
- 构建产物压缩 **34%**

### ⭐ 完整的测试
- 80%+ 代码覆盖率
- 单元测试 + 集成测试 + E2E
- 15+ 测试文件

---

## 🆘 需要帮助？

### 快速问题
查看 [best-practices.md](./docs/best-practices.md) 的"提示和技巧"章节

### 深入问题
1. 搜索 [GitHub Issues](https://github.com/ldesign/ldesign/issues)
2. 查看相关文档
3. 提交新 Issue

### 贡献想法
在 [GitHub Discussions](https://github.com/ldesign/ldesign/discussions) 讨论

---

## 🎊 立即开始

```bash
# 快速开始
npx ldesign-docs init
npx ldesign-docs generate
npx ldesign-docs serve --open

# 或查看示例
cd examples/vue-component-lib
pnpm install
pnpm docs:dev
```

---

<div align="center">

**准备好生成精美的文档了吗？**

从 [README.md](./README.md) 或 [QUICK_START.md](./QUICK_START.md) 开始！

或者直接运行：`npx ldesign-docs init` 🚀

</div>


