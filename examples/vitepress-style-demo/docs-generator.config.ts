/**
 * VitePress 风格示例配置
 */

import { defineConfig } from '@ldesign/docs-generator'
import { markdownPlugin, vueComponentPlugin, typedocPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  // 基础配置
  sourceDir: './docs',
  outputDir: './dist',
  cacheDir: '.cache/docs',

  // Vite 配置
  vite: {
    server: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: './dist',
    },
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,
    containers: true,
    emoji: true,
    anchor: true,
    theme: 'dark-plus',
  },

  // 站点配置
  site: {
    title: 'VitePress 风格示例',
    description: '展示所有 VitePress 功能',
    lang: 'zh-CN',
    darkMode: true,
    logo: '/logo.svg',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign' },
    ],
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2025 LDesign Team',
    },
  },

  // 导航配置
  navigation: {
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
      { text: '组件', link: '/components/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '安装', link: '/guide/installation' },
          ],
        },
        {
          text: 'Markdown',
          items: [
            { text: '容器', link: '/guide/markdown-containers' },
            { text: '代码块', link: '/guide/markdown-code' },
            { text: 'Emoji', link: '/guide/markdown-emoji' },
          ],
        },
      ],
      '/api/': 'auto',
      '/components/': 'auto',
    },
    breadcrumb: true,
    toc: true,
    editLink: {
      pattern: 'https://github.com/ldesign/ldesign/edit/main/tools/docs-generator/examples/vitepress-style-demo/:path',
      text: '在 GitHub 上编辑此页',
    },
  },

  // 主题配置
  theme: {
    name: 'vitepress-default',
    styles: {
      primaryColor: '#42b983',
    },
  },

  // 国际化
  i18n: {
    defaultLocale: 'zh-CN',
    locales: {
      'zh-CN': {
        lang: 'zh-CN',
        label: '简体中文',
      },
      'en-US': {
        lang: 'en-US',
        label: 'English',
      },
    },
  },

  // 插件
  plugins: [
    markdownPlugin(),
    vueComponentPlugin({
      include: 'src/components/**/*.vue',
    }),
    typedocPlugin({
      tsconfig: './tsconfig.json',
      entryPoints: ['./src/index.ts'],
    }),
  ],

  // 构建优化
  build: {
    codeSplit: {
      enabled: true,
      splitVendor: true,
    },
    imageOptimization: {
      enabled: true,
      convertToWebP: true,
    },
    prefetch: {
      enabled: true,
      strategy: 'lazy',
    },
  },

  // PWA
  pwa: {
    enabled: true,
    name: 'VitePress 风格示例',
    shortName: 'Docs',
    themeColor: '#42b983',
  },

  // 评论
  comments: {
    enabled: true,
    provider: 'giscus',
    giscus: {
      repo: 'ldesign/ldesign',
      repoId: 'R_xxx',
      category: 'General',
      categoryId: 'DIC_xxx',
    },
  },

  // 分析
  analytics: {
    enabled: true,
    google: {
      measurementId: 'G-XXXXXXXXXX',
    },
  },
})

