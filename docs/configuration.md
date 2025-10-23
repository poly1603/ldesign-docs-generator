# 配置参考

## 完整配置示例

```typescript
// docs-generator.config.ts
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  // ===== 基础配置 =====
  
  /** 源目录 */
  sourceDir: './src',
  
  /** 输出目录 */
  outputDir: './docs',
  
  /** 缓存目录 */
  cacheDir: '.cache/docs',
  
  /** 日志级别 */
  logLevel: 'info', // 'silent' | 'error' | 'warn' | 'info' | 'debug'

  // ===== Vite 配置 =====
  
  vite: {
    server: {
      port: 5173,
      open: true,
      https: false,
    },
    build: {
      outDir: './dist',
      minify: 'terser',
      sourcemap: false,
    },
  },

  // ===== Markdown 配置 =====
  
  markdown: {
    /** 显示代码行号 */
    lineNumbers: true,
    
    /** 启用容器 */
    containers: true,
    
    /** 启用 Emoji */
    emoji: true,
    
    /** 启用锚点 */
    anchor: true,
    
    /** 代码高亮主题 */
    theme: 'dark-plus', // 'dark-plus' | 'light-plus' | 'monokai' | 'nord' | 'one-dark-pro'
    
    /** Markdown-it 选项 */
    markdownItOptions: {
      html: true,
      linkify: true,
      typographer: true,
    },
  },

  // ===== 站点配置 =====
  
  site: {
    /** 站点标题 */
    title: '我的文档',
    
    /** 站点描述 */
    description: '一个强大的文档站点',
    
    /** 站点语言 */
    lang: 'zh-CN',
    
    /** 基础路径 */
    base: '/',
    
    /** 站点 Logo */
    logo: '/logo.svg',
    
    /** 是否启用暗黑模式 */
    darkMode: true,
    
    /** 社交链接 */
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign' },
      { icon: 'twitter', link: 'https://twitter.com/ldesign' },
    ],
    
    /** 页脚配置 */
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2025 LDesign Team',
    },
  },

  // ===== 导航配置 =====
  
  navigation: {
    /** 顶部导航栏 */
    topbar: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      {
        text: 'API',
        items: [
          { text: '核心 API', link: '/api/core' },
          { text: '工具 API', link: '/api/utils' },
        ],
      },
    ],
    
    /** 侧边栏 */
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/quick-start' },
          ],
        },
        {
          text: '深入',
          items: [
            { text: 'Markdown', link: '/guide/markdown' },
            { text: '主题', link: '/guide/theme' },
          ],
        },
      ],
      '/api/': 'auto', // 自动生成
    },
    
    /** 是否启用面包屑 */
    breadcrumb: true,
    
    /** 是否启用目录 */
    toc: true,
    
    /** 编辑链接配置 */
    editLink: {
      pattern: 'https://github.com/ldesign/ldesign/edit/main/:path',
      text: '在 GitHub 上编辑此页',
    },
    
    /** 上一页/下一页 */
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
  },

  // ===== 主题配置 =====
  
  theme: {
    /** 主题名称 */
    name: 'vitepress-default',
    
    /** 自定义样式 */
    styles: {
      primaryColor: '#42b983',
      backgroundColor: '#ffffff',
      textColor: '#213547',
    },
  },

  // ===== 国际化配置 =====
  
  i18n: {
    /** 默认语言 */
    defaultLocale: 'zh-CN',
    
    /** 语言配置 */
    locales: {
      'zh-CN': {
        lang: 'zh-CN',
        label: '简体中文',
        selectText: '选择语言',
      },
      'en-US': {
        lang: 'en-US',
        label: 'English',
        selectText: 'Languages',
      },
    },
  },

  // ===== 插件配置 =====
  
  plugins: [
    // Markdown 插件
    markdownPlugin(),
    
    // TypeDoc 插件（自动生成 API 文档）
    typedocPlugin({
      tsconfig: './tsconfig.json',
      entryPoints: ['./src/index.ts'],
    }),
    
    // Vue 组件插件
    vueComponentPlugin({
      include: 'src/components/**/*.vue',
    }),
    
    // Playground 插件
    playgroundPlugin({
      frameworks: ['vue'],
    }),
    
    // Mermaid 图表
    mermaidPlugin(),
    
    // 搜索插件
    algoliaPlugin({
      appId: process.env.ALGOLIA_APP_ID,
      apiKey: process.env.ALGOLIA_API_KEY,
      indexName: 'docs',
    }),
  ],

  // ===== 构建优化 =====
  
  build: {
    /** 代码分割 */
    codeSplit: {
      enabled: true,
      splitVendor: true,
    },
    
    /** 图片优化 */
    imageOptimization: {
      enabled: true,
      convertToWebP: true,
      quality: 80,
    },
    
    /** 预取策略 */
    prefetch: {
      enabled: true,
      strategy: 'lazy',
    },
  },

  // ===== 高级功能 =====
  
  /** PWA 配置 */
  pwa: {
    enabled: true,
    name: 'My Docs',
    shortName: 'Docs',
    themeColor: '#42b983',
  },
  
  /** 评论系统 */
  comments: {
    enabled: true,
    provider: 'giscus',
    giscus: {
      repo: 'owner/repo',
      repoId: 'xxx',
      category: 'General',
      categoryId: 'xxx',
    },
  },
  
  /** 分析统计 */
  analytics: {
    enabled: true,
    google: {
      measurementId: 'G-XXXXXXXXXX',
    },
  },
})
```

---

## 配置类型

### DocsGeneratorOptions

```typescript
interface DocsGeneratorOptions {
  sourceDir: string
  outputDir: string
  plugins?: DocsPlugin[]
  site?: SiteConfig
  theme?: ThemeConfig
  navigation?: NavigationConfig
  cacheDir?: string
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug'
  vite?: ViteConfig
  markdown?: MarkdownConfig
  i18n?: I18nConfig
  build?: BuildConfig
  pwa?: PWAConfig
  comments?: CommentsConfig
  analytics?: AnalyticsConfig
}
```

### SiteConfig

```typescript
interface SiteConfig {
  title: string
  description?: string
  lang?: string
  base?: string
  logo?: string
  darkMode?: boolean
  socialLinks?: SocialLink[]
  footer?: FooterConfig
}
```

### NavigationConfig

```typescript
interface NavigationConfig {
  sidebar?: 'auto' | SidebarConfig
  topbar?: NavItem[]
  breadcrumb?: boolean
  toc?: boolean | { level?: number[] }
  editLink?: EditLinkConfig
  docFooter?: DocFooterConfig
}
```

### MarkdownConfig

```typescript
interface MarkdownConfig {
  lineNumbers?: boolean
  containers?: boolean
  emoji?: boolean
  anchor?: boolean
  theme?: 'dark-plus' | 'light-plus' | 'monokai' | 'nord' | 'one-dark-pro'
  markdownItOptions?: any
  markdownItPlugins?: any[]
}
```

---

## 环境变量

### 开发环境

```bash
# .env.development
VITE_APP_TITLE=My Docs
VITE_API_URL=http://localhost:3000
```

### 生产环境

```bash
# .env.production
VITE_APP_TITLE=My Docs
VITE_API_URL=https://api.example.com
ALGOLIA_APP_ID=your_app_id
ALGOLIA_API_KEY=your_api_key
```

---

## 命令行选项

### dev 命令

```bash
ldesign-docs dev [options]

Options:
  -c, --config <path>   配置文件路径 (默认: docs-generator.config.js)
  -p, --port <port>     端口号 (默认: 3000)
  --open                自动打开浏览器
  --https               启用 HTTPS
  -h, --help            显示帮助信息
```

### build 命令

```bash
ldesign-docs build [options]

Options:
  -c, --config <path>   配置文件路径
  -s, --source <dir>    源目录
  -o, --output <dir>    输出目录
  -h, --help            显示帮助信息
```

### generate 命令

```bash
ldesign-docs generate [options]

Options:
  -c, --config <path>   配置文件路径
  -w, --watch           监听模式
  --log-level <level>   日志级别
  -h, --help            显示帮助信息
```

---

## 最佳实践

### 1. 使用 TypeScript 配置

```typescript
// docs-generator.config.ts
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  // 获得完整的类型提示
})
```

### 2. 分离配置

```typescript
// docs-generator.config.ts
import { siteConfig } from './config/site'
import { navigationConfig } from './config/navigation'

export default defineConfig({
  site: siteConfig,
  navigation: navigationConfig,
})
```

### 3. 使用环境变量

```typescript
export default defineConfig({
  site: {
    title: process.env.VITE_APP_TITLE || 'My Docs',
  },
  analytics: {
    google: {
      measurementId: process.env.GA_MEASUREMENT_ID,
    },
  },
})
```

---

## 下一步

- [Markdown 增强指南](./markdown.md)
- [主题开发指南](./theme-development.md)
- [插件开发指南](./plugin-development.md)
- [性能优化指南](./performance.md)


