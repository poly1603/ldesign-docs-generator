# Vue 组件库文档示例

这是一个使用 @ldesign/docs-generator 生成 Vue 组件库文档的完整示例。

## 📦 安装

```bash
pnpm install
```

## 🚀 使用

### 开发模式

```bash
# 生成文档并监听文件变化
pnpm docs:dev
```

### 构建生产版本

```bash
# 构建文档
pnpm docs:build
```

### 预览文档

```bash
# 启动文档服务器
pnpm docs:serve
```

## 📁 项目结构

```
vue-component-lib/
├── src/
│   ├── components/        # 组件源码
│   │   └── Button.vue
│   └── README.md          # 文档首页
├── docs/                  # 生成的文档（自动生成）
├── docs-generator.config.ts  # 文档配置
└── package.json
```

## ✨ 特性展示

本示例展示了以下功能：

- ✅ Vue 组件自动文档提取
- ✅ Props/Events/Slots 表格
- ✅ TypeScript 类型支持
- ✅ 交互式 Playground
- ✅ 代码示例高亮
- ✅ 响应式布局
- ✅ 暗黑模式

## 📖 配置说明

查看 `docs-generator.config.ts` 了解详细配置。

## 🎯 最佳实践

1. **组件注释**: 使用 JSDoc 注释描述组件
2. **Props 类型**: 使用 TypeScript 定义 Props 类型
3. **示例代码**: 在注释中添加 @example
4. **文档组织**: 使用合理的目录结构

## 📚 相关文档

- [插件开发指南](../../docs/plugin-development.md)
- [主题开发指南](../../docs/theme-development.md)
- [架构设计](../../docs/architecture.md)



