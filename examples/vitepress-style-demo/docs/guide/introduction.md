---
title: 介绍
description: 了解 @ldesign/docs-generator v3.0
---

# 介绍

## 什么是 @ldesign/docs-generator？

@ldesign/docs-generator 是一个**智能文档生成器**，它：

1. **包含 VitePress 的所有功能**
   - Vite 驱动的开发体验
   - 完整的 Markdown 增强
   - 精美的默认主题
   - 国际化支持

2. **提供独特的自动化能力**
   - TypeScript API 文档自动生成
   - Vue/React 组件文档自动提取
   - 交互式 Playground
   - 企业级插件系统

::: tip 最佳实践
如果你正在开发组件库或 TypeScript 库，v3.0 是最佳选择！
:::

---

## 核心概念

### 1. 自动化优先

传统文档生成器需要手写所有内容：

```markdown
## Button 组件

### Props

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | 'default' | 按钮类型 |
| size | string | 'medium' | 按钮大小 |

### Events

| 名称 | 参数 | 说明 |
|------|------|------|
| click | event | 点击事件 |
```

使用 v3.0，只需：

```typescript
// 在组件中写好注释
interface ButtonProps {
  /** 按钮类型 */
  type?: 'default' | 'primary' | 'danger'
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large'
}

// 配置插件
vueComponentPlugin()
```

文档自动生成！ ✨

### 2. 插件化架构

所有功能都通过插件实现：

```typescript
export default defineConfig({
  plugins: [
    markdownPlugin(),      // Markdown 文档
    typedocPlugin(),       // API 文档
    vueComponentPlugin(),  // Vue 组件
    playgroundPlugin(),    // 交互式示例
    mermaidPlugin(),       // 图表
    algoliaPlugin(),       // 搜索
  ],
})
```

### 3. 配置优先

通过配置控制所有行为：

```typescript
export default defineConfig({
  // 站点配置
  site: { /* ... */ },
  
  // Markdown 配置
  markdown: { /* ... */ },
  
  // 主题配置
  theme: { /* ... */ },
  
  // 导航配置
  navigation: { /* ... */ },
})
```

---

## 工作流程

### 开发流程

```
1. 编写代码 + 注释
   ↓
2. 配置插件
   ↓
3. 运行 dev 服务器
   ↓
4. 实时预览（HMR）
   ↓
5. 调整配置/内容
   ↓
6. 构建生产版本
```

### 文档生成流程

```
源文件（.ts/.vue/.md）
   ↓
插件解析（提取信息）
   ↓
转换为文档节点
   ↓
应用主题模板
   ↓
生成 HTML/CSS/JS
   ↓
优化和压缩
   ↓
输出最终文档
```

---

## 使用场景

### 1. 组件库文档

适合：Vue/React/Angular 组件库

**特点**：
- 自动提取组件 API
- 交互式示例
- 响应式设计

### 2. TypeScript 库文档

适合：工具库、SDK、框架

**特点**：
- 自动生成 API 参考
- 类型定义文档
- 函数签名文档

### 3. 产品文档

适合：产品说明、教程、博客

**特点**：
- Markdown 编写
- 精美主题
- 多语言支持

### 4. 技术博客

适合：技术分享、学习笔记

**特点**：
- Markdown 增强
- 代码高亮
- 评论系统

---

## 核心优势

### vs 手写文档

| 对比项 | 手写 | v3.0 |
|--------|------|------|
| API 文档 | 100% 手写 | **自动生成** |
| 组件文档 | 100% 手写 | **自动提取** |
| 维护成本 | 很高 | **很低** |
| 同步性 | 经常不同步 | **永远同步** |

### vs VitePress

| 对比项 | VitePress | v3.0 |
|--------|-----------|------|
| 开发体验 | ⚡ 极快 | ⚡ 极快 |
| Markdown | ✅ 完整 | ✅ 完整 |
| 自动化 | ❌ 无 | ✅ **强大** |
| 插件系统 | 基础 | **企业级** |

### vs Storybook

| 对比项 | Storybook | v3.0 |
|--------|-----------|------|
| 组件展示 | ✅ 优秀 | ✅ 优秀 |
| API 文档 | ⚠️ 需插件 | ✅ **内置** |
| 文档站点 | ⚠️ 有限 | ✅ **完整** |
| 学习曲线 | 陡峭 | **平缓** |

---

## 下一步

现在你已经了解了基础概念，可以：

1. [快速开始](./quick-start.md) - 5分钟搭建站点
2. [配置参考](../configuration.md) - 了解所有配置
3. [Markdown 增强](./markdown.md) - 学习 Markdown 语法
4. [主题开发](./theme-development.md) - 自定义主题

---

::: details 需要帮助？
- 查看 [API 参考](../api-reference.md)
- 查看 [示例项目](../../examples/)
- 提交 [GitHub Issue](https://github.com/ldesign/ldesign/issues)
:::

