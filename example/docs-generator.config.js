/**
 * LDesign Docs Generator 配置示例
 * 
 * 展示所有核心功能和配置选项
 */
export default {
  // ==================== 基础配置 ====================
  
  /** 站点标题 */
  title: 'LDesign Docs Example',
  
  /** 站点描述 */
  description: '展示 LDesign Docs Generator 的所有核心功能',
  
  /** 站点基础路径（部署到子路径时使用） */
  base: '/',
  
  /** 语言 */
  lang: 'zh-CN',
  
  // ==================== 目录配置 ====================
  
  /** 文档源目录 */
  docsDir: './docs',
  
  /** 源代码目录（用于自动生成 API 文档） */
  srcDir: './src',
  
  /** 输出目录 */
  outDir: './dist',
  
  /** 临时文件目录 */
  tempDir: './.temp',
  
  // ==================== 主题配置 ====================
  
  theme: {
    /** 导航栏配置 */
    nav: [
      { text: '首页', link: '/' },
      { 
        text: '指南', 
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '进阶指南', link: '/guide/advanced' },
        ],
      },
      { text: 'API 文档', link: '/api/' },
      { text: '组件', link: '/components/' },
      {
        text: '更多',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/ldesign' },
          { text: '变更日志', link: '/changelog' },
        ],
      },
    ],
    
    /** 侧边栏配置 */
    sidebar: {
      '/guide/': [
        {
          text: '入门',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '进阶指南', link: '/guide/advanced' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '核心 API', link: '/api/core' },
          ],
        },
      ],
      '/components/': [
        {
          text: '组件',
          items: [
            { text: 'Button 按钮', link: '/components/button' },
          ],
        },
      ],
    },
    
    /** 社交链接 */
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign' },
    ],
    
    /** 页脚配置 */
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 LDesign Team',
    },
    
    /** 编辑链接 */
    editLink: {
      pattern: 'https://github.com/ldesign/ldesign/edit/main/tools/docs-generator/example/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
    
    /** 最后更新时间 */
    lastUpdated: true,
  },
  
  // ==================== 功能配置 ====================
  
  /** 启用搜索 */
  search: true,
  
  /** 生成 sitemap.xml */
  sitemap: true,
  
  /** 站点 URL（用于 sitemap） */
  siteUrl: 'https://docs.ldesign.dev',
  
  /** 启用暗黑模式 */
  darkMode: true,
  
  // ==================== Markdown 配置 ====================
  
  markdown: {
    /** 代码高亮主题 */
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    
    /** 启用行号 */
    lineNumbers: true,
    
    /** 代码块语言别名 */
    languageAlias: {
      'ts': 'typescript',
      'js': 'javascript',
    },
    
    /** 自定义容器 */
    containers: {
      tip: '提示',
      warning: '警告',
      danger: '危险',
      details: '详情',
    },
  },
  
  // ==================== 构建配置 ====================
  
  build: {
    /** 预渲染路由（hybrid 模式） */
    prerenderRoutes: [
      '/',
      '/guide/getting-started',
      '/api/core',
      '/404',
    ],
    
    /** 代码分割 */
    chunkSizeWarningLimit: 500,
    
    /** 压缩 */
    minify: true,
  },
  
  // ==================== 插件配置 ====================
  
  plugins: [
    // 可以在这里添加插件
    // ['@ldesign/plugin-analytics', { ga: 'UA-XXXXXXXXX-X' }],
  ],
  
  // ==================== Vite 配置 ====================
  
  vite: {
    // 自定义 Vite 配置
    server: {
      port: 3000,
      host: true,
    },
  },
}
