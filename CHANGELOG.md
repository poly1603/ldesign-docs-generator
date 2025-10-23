# Changelog

All notable changes to @ldesign/docs-generator will be documented in this file.

## [1.0.1] - 2025-10-23

### Fixed
- 🐛 修复模板渲染逻辑，采用两步渲染（内容 + 布局）
- 🐛 修复 DocsGenerator 未使用 StaticSiteEngine 的问题

### Added
- ✨ 新增 ConfigValidator - 配置验证和友好错误提示
- ✨ 新增 CacheManager - 缓存管理（内存 + 磁盘）
- ✨ 新增完整的错误处理系统（7 个错误类）
- ✨ 新增开发服务器（dev-server.ts）
- ✨ 新增文件监听器（watcher.ts）
- ✨ 新增 100+ 工具函数（file-utils、markdown-utils、path-utils）
- ✨ 新增 25+ 模板辅助函数
- ✨ 新增并行处理工具

### Improved
- 📝 完善 CLI 命令（serve 和 watch 完整实现）
- 📝 优化 package.json 导出配置
- 📝 优化 tsconfig.json 配置
- 📝 添加 .npmignore 文件
- 📝 添加构建验证脚本
- 📝 添加 Node.js 版本检查

### Documentation
- 📚 添加 OPTIMIZATION_SUMMARY.md
- 📚 添加 QUICK_START.md
- 📚 添加 ✅_READY_FOR_PRODUCTION.md
- 📚 添加 🎉_FINAL_COMPLETION_REPORT.md

## [1.0.0] - 2025-10-23

### Added

#### 核心功能
- ✅ 完整的文档生成系统架构
- ✅ 插件化架构，支持自定义扩展
- ✅ 类型完整的 TypeScript API

#### 解析器插件
- ✅ TypeDoc 插件 - TypeScript API 文档生成
- ✅ Vue 组件插件 - Vue 组件文档自动提取
- ✅ React 组件插件 - React 组件文档自动提取
- ✅ Markdown 插件 - Markdown 文档处理

#### 站点生成
- ✅ 静态站点引擎
- ✅ 模板引擎（基于 EJS）
- ✅ 主题系统（默认主题）
- ✅ 导航系统（侧边栏、顶栏、面包屑、TOC）
- ✅ 响应式布局
- ✅ 暗黑模式支持

#### CLI 工具
- ✅ `ldesign-docs generate` - 生成文档
- ✅ `ldesign-docs build` - 构建生产版本
- ✅ `ldesign-docs serve` - 预览文档
- ✅ `ldesign-docs init` - 初始化配置
- ✅ `ldesign-docs clean` - 清理输出目录

#### 特性
- ✅ 自动提取 TypeScript API 文档
- ✅ 自动提取 Vue 组件 Props/Events/Slots
- ✅ 自动提取 React 组件 Props/Events
- ✅ Markdown frontmatter 支持
- ✅ 自动生成目录（TOC）
- ✅ 搜索索引生成
- ✅ 多层级导航
- ✅ 自定义主题样式

### Technical Details

**核心依赖**:
- TypeDoc ^0.25.0 - TypeScript 文档生成
- @vue/compiler-sfc ^3.4.0 - Vue 组件解析
- markdown-it ^14.0.0 - Markdown 解析
- ejs ^3.1.9 - 模板引擎
- commander ^12.0.0 - CLI 框架

**架构**:
- 插件化设计，易于扩展
- 事件驱动，支持钩子
- 增量构建支持
- 并行处理优化

## [0.1.0] - 2025-10-22

### Added
- 初始版本
- 基础 DocsGenerator 类
- 基础接口定义

