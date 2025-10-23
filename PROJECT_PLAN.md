# @ldesign/docs-generator 完整项目计划书

<div align="center">

# 📖 @ldesign/docs-generator v0.1.0

**文档生成器 - API 文档自动生成、组件文档、Storybook 集成、多版本支持**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./CHANGELOG.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](./tsconfig.json)
[![Generators](https://img.shields.io/badge/generators-API%2BComponent%2BSite-green.svg)](#功能清单)
[![Platforms](https://img.shields.io/badge/platforms-TypeDoc%2BStorybook%2BVitePress-blue.svg)](#技术栈)

</div>

---

## 🚀 快速导航

| 想要... | 查看章节 | 预计时间 |
|---------|---------|---------|
| 📖 了解文档生成器 | [项目概览](#项目概览) | 3 分钟 |
| 🔍 查看参考项目 | [参考项目分析](#参考项目深度分析) | 20 分钟 |
| ✨ 查看功能清单 | [功能清单](#功能清单) | 22 分钟 |
| 🏗️ 了解架构 | [架构设计](#架构设计) | 15 分钟 |

---

## 📊 项目全景图

```
┌──────────────────────────────────────────────────────────────┐
│          @ldesign/docs-generator - 文档生成器全景              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🎯 API 文档生成                                              │
│  ├─ 📝 TypeDoc 集成（TypeScript API）                        │
│  ├─ 📄 JSDoc 集成（JavaScript API）                          │
│  ├─ 🔍 自动提取注释                                           │
│  ├─ 📋 类型定义文档                                           │
│  ├─ ⚡ 函数签名文档                                           │
│  └─ 🎯 接口/类/枚举文档                                       │
│                                                              │
│  🧩 组件文档生成                                              │
│  ├─ 📊 组件 API 自动提取                                     │
│  ├─ 📋 Props 表格生成                                        │
│  ├─ 🎭 Events 列表生成                                       │
│  ├─ 🔌 Slots 说明生成                                        │
│  └─ 🎨 组件示例生成                                           │
│                                                              │
│  📚 文档站点生成                                              │
│  ├─ 🏗️ VitePress 站点                                       │
│  ├─ 📖 Docusaurus 站点                                      │
│  ├─ 🎨 自定义主题                                             │
│  ├─ 📱 响应式布局                                             │
│  └─ 🌙 暗黑模式                                               │
│                                                              │
│  🧭 导航系统                                                  │
│  ├─ 📑 侧边栏（自动生成）                                     │
│  ├─ 🎯 顶部导航                                               │
│  ├─ 🍞 面包屑导航                                             │
│  └─ 📍 页内导航（TOC）                                        │
│                                                              │
│  🔍 搜索功能                                                  │
│  ├─ 🔎 全文搜索（Algolia）                                   │
│  ├─ 💻 本地搜索（MiniSearch）                                │
│  ├─ 💡 搜索建议                                               │
│  └─ 🎯 搜索结果高亮                                           │
│                                                              │
│  🎮 交互示例                                                  │
│  ├─ 💻 代码示例（可复制）                                     │
│  ├─ 🎪 实时预览（Playground）                                │
│  ├─ 🎛️ 参数调节器                                            │
│  └─ 🎨 语法高亮                                               │
│                                                              │
│  🔄 多版本支持                                                │
│  ├─ 📚 版本切换器                                             │
│  ├─ 📦 版本归档                                               │
│  ├─ 🔀 版本对比                                               │
│  └─ 📝 迁移指南                                               │
│                                                              │
│  🤖 AI 增强                                                   │
│  ├─ 💬 AI 文档助手                                            │
│  ├─ 🌐 AI 文档翻译                                            │
│  └─ 📊 智能建议                                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 项目概览

### 核心价值主张

@ldesign/docs-generator 是一个**智能文档生成器**，提供：

1. **API 文档自动化** - TypeScript/JavaScript API 文档自动生成
2. **组件文档自动化** - Vue/React 组件文档自动提取
3. **文档站点生成** - VitePress/Docusaurus 站点一键生成
4. **交互式示例** - Playground、参数调节、实时预览
5. **多版本管理** - 版本切换、归档、对比、迁移指南
6. **智能搜索** - 全文搜索、本地搜索、智能建议
7. **AI 增强** - AI 助手、自动翻译、智能补全

### 解决的问题

- ❌ **手写文档太累** - API 文档需要手动编写
- ❌ **文档更新不及时** - 代码改了文档没改
- ❌ **组件文档难写** - Props/Events/Slots 手动维护
- ❌ **缺少示例** - 没有交互式示例
- ❌ **多版本难管理** - 不同版本文档混乱
- ❌ **搜索不好用** - 找不到想要的内容

### 我们的解决方案

- ✅ **自动提取** - 从代码自动生成文档
- ✅ **实时同步** - 代码变化自动更新
- ✅ **智能提取** - 自动提取组件元信息
- ✅ **交互示例** - Playground 实时预览
- ✅ **版本管理** - 多版本自动管理
- ✅ **强大搜索** - Algolia + 本地搜索

---

## 📚 参考项目深度分析

### 1. typedoc (★★★★★)

**项目信息**:
- GitHub: https://github.com/TypeStrong/typedoc
- Stars: 7,000+
- NPM: typedoc
- 下载量: 2M+/week

**核心特点**:
- ✅ TypeScript 官方推荐
- ✅ 自动提取 TSDoc 注释
- ✅ 类型定义文档化
- ✅ 模块化文档
- ✅ 多种输出格式（HTML/JSON）
- ✅ 主题系统
- ✅ 插件扩展

**借鉴要点**:
1. **注释提取** - @param/@returns/@example
2. **类型文档** - interface/type/class 文档化
3. **模块组织** - 模块/命名空间层级
4. **继承关系** - extends/implements 展示
5. **主题系统** - 默认主题 + 自定义
6. **JSON 输出** - 结构化数据
7. **插件 API** - 可扩展

**功能借鉴**:
- [ ] TSDoc 注释提取
- [ ] 类型文档生成
- [ ] 模块组织
- [ ] 继承关系展示
- [ ] 主题系统
- [ ] JSON API
- [ ] 插件系统

### 2. storybook (★★★★★)

**项目信息**:
- GitHub: https://github.com/storybookjs/storybook
- Stars: 83,000+
- NPM: @storybook/react
- 下载量: 5M+/week

**核心特点**:
- ✅ 组件隔离开发
- ✅ Stories（组件故事）
- ✅ Args（参数控制）
- ✅ Actions（事件记录）
- ✅ Docs（自动文档）
- ✅ Addons（插件生态）
- ✅ 多框架支持

**借鉴要点**:
1. **CSF 格式** - Component Story Format
2. **Args 系统** - 参数控制和文档
3. **Docs Addon** - 自动生成组件文档
4. **ArgTypes** - 类型和控件定义
5. **Actions** - 事件监听和展示
6. **Addons** - 丰富的插件系统
7. **MDX** - Markdown + JSX

**功能借鉴**:
- [ ] Story 格式
- [ ] Args 参数系统
- [ ] 自动文档生成
- [ ] 交互控件
- [ ] 事件记录
- [ ] Addon 系统
- [ ] MDX 支持

### 3. vitepress (★★★★★)

**项目信息**:
- GitHub: https://github.com/vuejs/vitepress
- Stars: 12,000+
- 团队: Vue 团队
- 下载量: 500k+/week

**核心特点**:
- ✅ Vite 驱动（极速）
- ✅ Vue 组件集成
- ✅ Markdown 增强
- ✅ 自定义主题
- ✅ 侧边栏自动生成
- ✅ 全文搜索
- ✅ SSG（静态生成）

**借鉴要点**:
1. **Markdown 增强** - 容器/代码组/导入代码
2. **Vue 集成** - Markdown 中使用 Vue 组件
3. **主题系统** - 默认主题 + 自定义
4. **侧边栏配置** - 自动生成或手动配置
5. **搜索** - MiniSearch 本地搜索
6. **SSG** - 静态站点生成
7. **性能** - Vite HMR

**功能借鉴**:
- [ ] Markdown 增强
- [ ] Vue 组件集成
- [ ] 主题系统
- [ ] 侧边栏生成
- [ ] 本地搜索
- [ ] SSG 生成

### 4. docusaurus (★★★★★)

**项目信息**:
- GitHub: https://github.com/facebook/docusaurus
- Stars: 53,000+
- 团队: Meta (Facebook)
- 下载量: 700k+/week

**核心特点**:
- ✅ React 驱动
- ✅ MDX 支持
- ✅ 版本化文档
- ✅ 国际化（i18n）
- ✅ Algolia 搜索
- ✅ 插件系统
- ✅ 主题系统

**借鉴要点**:
1. **版本化** - 多版本文档管理
2. **MDX** - Markdown + React 组件
3. **i18n** - 多语言支持
4. **Algolia** - 强大的全文搜索
5. **插件** - 丰富的插件生态
6. **主题** - swizzling 自定义
7. **配置** - docusaurus.config.js

**功能借鉴**:
- [ ] 版本化系统
- [ ] MDX 支持
- [ ] i18n 国际化
- [ ] Algolia 集成
- [ ] 插件系统

### 5. jsdoc (★★★★☆)

**项目信息**:
- GitHub: https://github.com/jsdoc/jsdoc
- Stars: 15,000+
- NPM: jsdoc
- 下载量: 3M+/week

**核心特点**:
- ✅ JavaScript 文档标准
- ✅ 注释提取
- ✅ 类型推断
- ✅ 多种模板
- ✅ 插件支持

**借鉴要点**:
1. **JSDoc 标准** - @param/@returns/@typedef
2. **注释解析** - 提取结构化信息
3. **模板系统** - 可定制输出
4. **类型推断** - @type 类型信息

**功能借鉴**:
- [ ] JSDoc 解析
- [ ] 注释提取
- [ ] 模板系统

### 参考项目功能对比

| 功能 | typedoc | storybook | vitepress | docusaurus | jsdoc | **@ldesign/docs-generator** |
|------|---------|-----------|-----------|------------|-------|---------------------------|
| API 文档 | ✅ | ❌ | ⚠️ | ⚠️ | ✅ | ✅ 🎯 |
| 组件文档 | ❌ | ✅ | ⚠️ | ⚠️ | ❌ | ✅ 🎯 |
| 文档站点 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 交互示例 | ❌ | ✅ | ⚠️ | ✅ | ❌ | ✅ 🎯 |
| 多版本 | ⚠️ | ⚠️ | ⚠️ | ✅ | ❌ | ✅ 🎯 |
| 搜索 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 主题 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| i18n | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ 计划 🎯 |
| 插件 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI 助手 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ 计划 🎯 |
| TypeScript | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Bundle | 中 | 大 | 小 | 大 | 小 | **<50KB** 🎯 |

**总结**: @ldesign/docs-generator 整合了 TypeDoc 的 API 文档 + Storybook 的组件文档 + VitePress/Docusaurus 的站点生成。

---

## ✨ 功能清单

### P0 核心（18项）

#### API 文档生成
- [ ] TypeDoc 集成（TypeScript API）
- [ ] JSDoc 集成（JavaScript API）
- [ ] 自动提取注释
- [ ] 类型定义文档
- [ ] 函数签名文档
- [ ] 接口文档

#### Markdown 处理
- [ ] Markdown 文件扫描
- [ ] Markdown 解析
- [ ] 目录生成（TOC）
- [ ] 代码块高亮
- [ ] 链接检查

#### 文档站点
- [ ] VitePress 集成
- [ ] Docusaurus 集成
- [ ] 自定义主题
- [ ] 响应式布局
- [ ] 暗黑模式

#### 导航系统
- [ ] 侧边栏导航
- [ ] 顶部导航
- [ ] 面包屑
- [ ] 页内导航

### P1 高级（20项）

#### 组件文档
- [ ] 组件 API 文档
- [ ] 组件 Props 表格
- [ ] 组件事件列表
- [ ] 组件插槽说明

#### 交互示例
- [ ] 代码示例（可复制）
- [ ] 实时预览（Playground）
- [ ] 参数调节器
- [ ] 示例代码高亮

#### 搜索功能
- [ ] 全文搜索（Algolia）
- [ ] 本地搜索
- [ ] 搜索建议
- [ ] 搜索结果高亮

#### 多版本支持
- [ ] 版本切换器
- [ ] 版本归档
- [ ] 版本对比
- [ ] 迁移指南生成

#### 文档增强
- [ ] 代码运行（CodeSandbox）
- [ ] 图表渲染（Mermaid）
- [ ] 数学公式（KaTeX）
- [ ] 视频嵌入

### P2 扩展（12项）
- [ ] AI 文档助手（问答）
- [ ] AI 文档翻译（多语言）
- [ ] 文档统计（阅读量/停留时间）
- [ ] 文档反馈系统
- [ ] 文档协作（多人编辑）

---

## 🏗️ 架构设计

```
┌────────────────────────────────────────────────────────┐
│            @ldesign/docs-generator                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │  DocsGenerator   │ ────▶│  Parser System  │       │
│  │                  │      │                  │       │
│  │ - generate()     │      │ - TypeDoc        │       │
│  │ - build()        │      │ - JSDoc          │       │
│  │ - serve()        │      │ - ComponentParser│       │
│  └──────────────────┘      └──────────────────┘       │
│         │                           │                  │
│         ▼                           ▼                  │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │  SiteGenerator   │      │  TemplateEngine │       │
│  │                  │      │                  │       │
│  │ - VitePress      │      │ - markdown       │       │
│  │ - Docusaurus     │      │ - vue/react      │       │
│  └──────────────────┘      └──────────────────┘       │
│                                                        │
│  ┌────────────────────────────────────────────┐      │
│  │         API Docs Module                    │      │
│  ├─ TypeDocIntegration（TypeScript）           │      │
│  ├─ JSDocIntegration（JavaScript）             │      │
│  ├─ CommentExtractor（注释提取）               │      │
│  └─ TypeResolver（类型解析）                   │      │
│  └────────────────────────────────────────────┘      │
│                                                        │
│  ┌────────────────────────────────────────────┐      │
│  │       Component Docs Module                │      │
│  ├─ VueComponentParser（Vue 组件）             │      │
│  ├─ ReactComponentParser（React 组件）         │      │
│  ├─ PropsExtractor（Props 提取）               │      │
│  ├─ EventsExtractor（Events 提取）             │      │
│  └─ ExampleGenerator（示例生成）               │      │
│  └────────────────────────────────────────────┘      │
│                                                        │
│  ┌────────────────────────────────────────────┐      │
│  │         Site Building Module               │      │
│  ├─ VitePressBuilder（VitePress 构建）        │      │
│  ├─ DocusaurusBuilder（Docusaurus 构建）      │      │
│  ├─ ThemeManager（主题管理）                   │      │
│  ├─ NavigationGenerator（导航生成）           │      │
│  └─ SearchIntegration（搜索集成）              │      │
│  └────────────────────────────────────────────┘      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ 技术栈

### 核心技术

- **TypeScript 5.7+**
- **TypeDoc API** - API 文档生成
- **Vue Compiler** - Vue 组件解析
- **React Docgen** - React 组件解析
- **Markdown-it** - Markdown 解析
- **Vite/Webpack** - 构建工具

### 内部依赖

```json
{
  "dependencies": {
    "@ldesign/kit": "workspace:*"    // Node.js 工具库
  }
}
```

### 外部依赖

```json
{
  "dependencies": {
    "typedoc": "^0.25.0",
    "vitepress": "^1.0.0",
    "@storybook/vue3": "^7.0.0",
    "@storybook/react": "^7.0.0",
    "markdown-it": "^14.0.0"
  },
  "optionalDependencies": {
    "docusaurus": "^3.0.0",
    "algolia": "^4.0.0"
  }
}
```

---

## 🗺️ 开发路线图

### v0.1.0 - MVP（当前）✅

**已完成**:
- [x] DocsGenerator 类
- [x] 基础接口

**待完成**:
- [ ] TypeDoc 集成
- [ ] API 文档生成
- [ ] 基础站点

### v0.2.0 - API + 组件（5周）

**功能**:
- [ ] TypeDoc/JSDoc 完整集成
- [ ] Vue/React 组件解析
- [ ] Props/Events 文档
- [ ] VitePress 站点生成
- [ ] 基础主题

### v0.3.0 - 交互和搜索（5周）

**功能**:
- [ ] 交互式 Playground
- [ ] Algolia 全文搜索
- [ ] 多版本支持
- [ ] 自定义主题

### v1.0.0 - AI 和完整功能（8周）

**功能**:
- [ ] AI 文档助手
- [ ] AI 翻译
- [ ] 文档统计
- [ ] 完整文档

---

## 📋 详细任务分解

### Week 1-5: v0.2.0

#### Week 1-2: TypeDoc 集成（80h）
- [ ] TypeDoc API 集成
- [ ] 注释提取
- [ ] 类型文档生成
- [ ] JSON 输出
- [ ] 测试

#### Week 3: 组件解析（40h）
- [ ] Vue 组件解析
- [ ] React 组件解析
- [ ] Props/Events 提取

#### Week 4-5: 站点生成（80h）
- [ ] VitePress 集成
- [ ] 侧边栏生成
- [ ] 导航系统
- [ ] 文档和测试

---

**文档版本**: 2.0（详细版）  
**创建时间**: 2025-10-22  
**页数**: 约 22 页


