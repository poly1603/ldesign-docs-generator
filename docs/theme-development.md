# 主题开发指南

## 📖 概述

@ldesign/docs-generator 支持完全自定义的主题系统。你可以创建自己的主题来定制文档站点的外观和行为。

## 🎨 主题结构

### 基本结构

```
my-theme/
├── templates/              # 模板文件
│   ├── layout.ejs         # 主布局
│   ├── component.ejs      # 组件文档模板
│   ├── api.ejs            # API 文档模板
│   ├── markdown.ejs       # Markdown 文档模板
│   ├── index.ejs          # 首页模板
│   └── partials/          # 片段模板
│       ├── header.ejs
│       ├── footer.ejs
│       └── sidebar.ejs
├── assets/                # 静态资源
│   ├── styles/
│   │   └── main.css
│   ├── scripts/
│   │   └── main.js
│   └── images/
├── theme.config.js        # 主题配置
└── README.md
```

## 🏗️ 创建主题

### 1. 创建主题目录

```bash
mkdir my-theme
cd my-theme
```

### 2. 创建主布局模板

```ejs
<!-- templates/layout.ejs -->
<!DOCTYPE html>
<html lang="<%= site.lang || 'zh-CN' %>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= doc.metadata.title || doc.name %> - <%= site.title %></title>
  
  <!-- 样式 -->
  <link rel="stylesheet" href="/assets/styles/main.css">
  
  <!-- 自定义 Head -->
  <% if (site.head) { %>
    <% site.head.forEach(head => { %>
      <<%= head.tag %> 
        <% if (head.attrs) { %>
          <% Object.entries(head.attrs).forEach(([key, value]) => { %>
            <%= key %>="<%= value %>"
          <% }) %>
        <% } %>
      ><%= head.content || '' %></<%= head.tag %>>
    <% }) %>
  <% } %>
</head>
<body>
  <!-- 顶部导航 -->
  <%- include('partials/header', { site, navigation }) %>
  
  <!-- 主内容区 -->
  <div class="container">
    <!-- 侧边栏 -->
    <%- include('partials/sidebar', { navigation, doc }) %>
    
    <!-- 内容 -->
    <main class="content">
      <%- content %>
    </main>
    
    <!-- TOC -->
    <% if (navigation.toc && doc.content.toc) { %>
      <aside class="toc">
        <%- include('partials/toc', { toc: doc.content.toc }) %>
      </aside>
    <% } %>
  </div>
  
  <!-- 底部 -->
  <%- include('partials/footer', { site }) %>
  
  <!-- 脚本 -->
  <script src="/assets/scripts/main.js"></script>
</body>
</html>
```

### 3. 创建内容模板

```ejs
<!-- templates/component.ejs -->
<article class="component-doc">
  <h1><%= doc.name %></h1>
  
  <% if (doc.content.description) { %>
    <p class="description"><%= doc.content.description %></p>
  <% } %>
  
  <!-- Props 表格 -->
  <% if (doc.content.props && doc.content.props.length > 0) { %>
    <section class="props-section">
      <h2>Props</h2>
      <table class="props-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>默认值</th>
            <th>必填</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <% doc.content.props.forEach(prop => { %>
            <tr>
              <td><code><%= prop.name %></code></td>
              <td><code><%= typeof prop.type === 'string' ? prop.type : prop.type.name %></code></td>
              <td><%= prop.defaultValue ? `<code>${prop.defaultValue}</code>` : '-' %></td>
              <td><%= prop.required ? '是' : '否' %></td>
              <td><%= prop.description || '-' %></td>
            </tr>
          <% }) %>
        </tbody>
      </table>
    </section>
  <% } %>
  
  <!-- Events -->
  <% if (doc.content.events && doc.content.events.length > 0) { %>
    <section class="events-section">
      <h2>Events</h2>
      <ul class="events-list">
        <% doc.content.events.forEach(event => { %>
          <li>
            <code><%= event.name %></code>
            <% if (event.description) { %>
              - <%= event.description %>
            <% } %>
          </li>
        <% }) %>
      </ul>
    </section>
  <% } %>
  
  <!-- 示例 -->
  <% if (doc.content.examples && doc.content.examples.length > 0) { %>
    <section class="examples-section">
      <h2>示例</h2>
      <% doc.content.examples.forEach(example => { %>
        <div class="example">
          <% if (example.title) { %>
            <h3><%= example.title %></h3>
          <% } %>
          <% if (example.description) { %>
            <p><%= example.description %></p>
          <% } %>
          <pre><code class="language-<%= example.language || 'javascript' %>"><%= example.code %></code></pre>
        </div>
      <% }) %>
    </section>
  <% } %>
</article>
```

### 4. 创建样式

```css
/* assets/styles/main.css */
:root {
  --primary-color: #3498db;
  --bg-color: #ffffff;
  --text-color: #1a202c;
  --border-color: #e2e8f0;
  --code-bg: #f7fafc;
  --sidebar-width: 280px;
  --content-max-width: 800px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--text-color);
  background-color: var(--bg-color);
  line-height: 1.6;
}

/* 容器布局 */
.container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
}

/* 侧边栏 */
.sidebar {
  width: var(--sidebar-width);
  padding: 24px;
  border-right: 1px solid var(--border-color);
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

/* 内容区 */
.content {
  flex: 1;
  max-width: var(--content-max-width);
  padding: 24px 48px;
}

/* TOC */
.toc {
  width: 240px;
  padding: 24px;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

/* 响应式 */
@media (max-width: 1200px) {
  .toc {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 0.3s;
    z-index: 100;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .content {
    padding: 16px;
  }
}

/* 暗黑模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a202c;
    --text-color: #e2e8f0;
    --border-color: #4a5568;
    --code-bg: #2d3748;
  }
}
```

### 5. 主题配置文件

```javascript
// theme.config.js
export default {
  name: 'my-theme',
  version: '1.0.0',
  author: 'Your Name',
  
  // 样式变量
  styles: {
    primaryColor: '#3498db',
    sidebarWidth: '280px',
    contentMaxWidth: '800px',
  },
  
  // 模板引擎
  engine: 'ejs', // 或 'handlebars', 'nunjucks'
  
  // 自定义辅助函数
  helpers: {
    formatDate: (date) => {
      return new Date(date).toLocaleDateString('zh-CN')
    },
  },
}
```

## 🔧 使用主题

### 方式 1: 本地主题

```typescript
// docs-generator.config.ts
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  theme: {
    name: 'my-theme',
    templateDir: './my-theme/templates',
  },
})
```

### 方式 2: NPM 包主题

```bash
npm install @myorg/docs-generator-my-theme
```

```typescript
import { defineConfig } from '@ldesign/docs-generator'
import myTheme from '@myorg/docs-generator-my-theme'

export default defineConfig({
  theme: myTheme,
})
```

## 📚 模板变量

### 所有模板都可以访问以下变量：

#### doc - 当前文档节点
```typescript
{
  type: 'api' | 'component' | 'markdown' | 'custom',
  name: string,
  path: string,
  metadata: Record<string, any>,
  content: any,
}
```

#### site - 站点配置
```typescript
{
  title: string,
  description: string,
  logo: string,
  base: string,
  lang: string,
  darkMode: boolean,
  head: HeadConfig[],
  socialLinks: SocialLink[],
}
```

#### navigation - 导航结构
```typescript
{
  sidebar: SidebarItem[],
  topbar: NavItem[],
  breadcrumb: (path: string) => BreadcrumbItem[],
  toc: (doc: DocNode) => TOCItem[],
}
```

#### theme - 主题配置
```typescript
{
  name: string,
  styles: Record<string, any>,
  scripts: Record<string, string>,
}
```

## 💡 高级技巧

### 1. 条件渲染

```ejs
<!-- 根据文档类型渲染不同内容 -->
<% if (doc.type === 'component') { %>
  <%- include('component', { doc }) %>
<% } else if (doc.type === 'api') { %>
  <%- include('api', { doc }) %>
<% } else { %>
  <%- include('markdown', { doc }) %>
<% } %>
```

### 2. 使用辅助函数

```ejs
<!-- 格式化日期 -->
<time><%= formatDate(doc.metadata.updatedAt) %></time>

<!-- 生成相对路径 -->
<a href="<%= relativePath(doc.path, '/index.html') %>">首页</a>

<!-- 截断文本 -->
<p><%= truncate(doc.content.description, 100) %></p>
```

### 3. 自定义组件

```ejs
<!-- 定义可复用的组件 -->
<%
function renderCodeBlock(code, language) {
  return `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`
}
%>

<!-- 使用组件 -->
<%- renderCodeBlock(example.code, 'typescript') %>
```

### 4. 动态样式

```ejs
<style>
:root {
  <% if (theme.styles) { %>
    <% Object.entries(theme.styles).forEach(([key, value]) => { %>
      --<%= kebabCase(key) %>: <%= value %>;
    <% }) %>
  <% } %>
}
</style>
```

## 🎯 常见场景

### 场景 1: 添加自定义页面

```typescript
// docs-generator.config.ts
export default defineConfig({
  theme: {
    name: 'my-theme',
    templateDir: './my-theme/templates',
  },
  
  plugins: [
    {
      name: 'custom-pages',
      version: '1.0.0',
      
      generate: async (context) => {
        // 生成自定义页面
        const template = await fs.readFile('./my-theme/templates/custom.ejs', 'utf-8')
        const html = ejs.render(template, { site: context.siteConfig })
        
        await fs.writeFile(
          path.join(context.outputDir, 'custom.html'),
          html
        )
      },
    },
  ],
})
```

### 场景 2: 添加暗黑模式切换

```javascript
// assets/scripts/theme-toggle.js
function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle')
  
  // 检查系统偏好
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const savedTheme = localStorage.getItem('theme')
  const theme = savedTheme || (prefersDark ? 'dark' : 'light')
  
  document.documentElement.setAttribute('data-theme', theme)
  
  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme')
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  })
}

initThemeToggle()
```

### 场景 3: 自定义代码高亮

```html
<!-- 引入 Prism.js -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css">
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>

<script>
  Prism.highlightAll()
</script>
```

## 📦 发布主题

### 1. 创建 NPM 包

```json
{
  "name": "@myorg/docs-generator-theme-awesome",
  "version": "1.0.0",
  "description": "Awesome theme for @ldesign/docs-generator",
  "main": "index.js",
  "files": [
    "templates",
    "assets",
    "index.js"
  ],
  "keywords": [
    "ldesign",
    "docs-generator",
    "theme"
  ],
  "peerDependencies": {
    "@ldesign/docs-generator": "^2.0.0"
  }
}
```

### 2. 导出主题

```javascript
// index.js
const path = require('path')

module.exports = {
  name: 'awesome',
  templateDir: path.join(__dirname, 'templates'),
  styles: {
    primaryColor: '#ff6b6b',
    sidebarWidth: '300px',
  },
  assets: [
    path.join(__dirname, 'assets'),
  ],
}
```

### 3. 发布

```bash
npm publish --access public
```

## 🎨 内置主题参考

### default 主题

位于 `templates/default/`，包含：
- 响应式设计
- 暗黑模式支持
- 现代化 UI
- 完整的导航系统

可以以此为基础进行修改。

## 💡 最佳实践

### 1. 性能优化
- 压缩 CSS 和 JS
- 使用 CDN 加载外部资源
- 图片优化和懒加载
- 代码分割

### 2. 可访问性
- 语义化 HTML
- 合适的对比度
- 键盘导航支持
- ARIA 标签

### 3. SEO 友好
- 合理的标题层级
- Meta 标签
- 结构化数据
- Sitemap

### 4. 移动端优化
- 响应式设计
- 触摸友好
- 快速加载
- 离线支持（可选）

## 🔍 调试主题

### 1. 使用开发服务器

```bash
npx ldesign-docs generate --watch
npx ldesign-docs serve --port 3000
```

### 2. 检查生成的 HTML

生成的 HTML 文件位于输出目录，可以直接查看源码。

### 3. 使用浏览器开发者工具

检查样式、布局和 JavaScript 行为。

## 📖 相关资源

- [EJS 文档](https://ejs.co/)
- [Handlebars 文档](https://handlebarsjs.com/)
- [Nunjucks 文档](https://mozilla.github.io/nunjucks/)
- [VitePress 主题](https://vitepress.dev/guide/custom-theme)

---

**享受创作主题的乐趣！** 🎨



