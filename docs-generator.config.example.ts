/**
 * @ldesign/docs-generator 配置示例
 */

import { defineConfig } from './src'
import { typedocPlugin, vueComponentPlugin, reactComponentPlugin, markdownPlugin } from './src'

export default defineConfig({
  // ========== 基础配置 ==========

  /**
   * 源代码目录
   */
  sourceDir: './src',

  /**
   * 文档输出目录
   */
  outputDir: './docs',

  /**
   * 日志级别
   */
  logLevel: 'info',

  /**
   * 缓存目录
   */
  cacheDir: '.cache/docs-generator',

  // ========== 插件配置 ==========

  plugins: [
    // TypeScript API 文档
    typedocPlugin({
      tsconfig: './tsconfig.json',
      entryPoints: ['./src/index.ts'],
      includePrivate: false,
      includeInternal: false,
    }),

    // Vue 组件文档
    vueComponentPlugin({
      include: '**/*.vue',
      exclude: '**/node_modules/**',
    }),

    // React 组件文档
    reactComponentPlugin({
      include: '**/*.{tsx,jsx}',
      exclude: '**/node_modules/**',
    }),

    // Markdown 文档
    markdownPlugin({
      include: '**/*.md',
      exclude: '**/node_modules/**',
    }),
  ],

  // ========== 站点配置 ==========

  site: {
    /**
     * 站点标题
     */
    title: 'LDesign 文档',

    /**
     * 站点描述
     */
    description: '企业级设计系统和组件库',

    /**
     * 语言
     */
    lang: 'zh-CN',

    /**
     * 基础路径
     */
    base: '/',

    /**
     * Logo
     */
    logo: '/logo.svg',

    /**
     * 暗黑模式
     */
    darkMode: true,

    /**
     * 社交链接
     */
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/ldesign/ldesign',
      },
    ],
  },

  // ========== 主题配置 ==========

  theme: {
    name: 'default',
    styles: {
      primaryColor: '#3498db',
      backgroundColor: '#ffffff',
      textColor: '#333333',
    },
  },

  // ========== 导航配置 ==========

  navigation: {
    /**
     * 侧边栏配置
     * 'auto' 表示自动生成
     */
    sidebar: 'auto',

    /**
     * 顶部导航
     */
    topbar: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '组件', link: '/components/' },
      {
        text: '更多',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/ldesign' },
          { text: '更新日志', link: '/changelog' },
        ],
      },
    ],

    /**
     * 面包屑
     */
    breadcrumb: true,

    /**
     * 目录 (TOC)
     */
    toc: true,
  },
})




