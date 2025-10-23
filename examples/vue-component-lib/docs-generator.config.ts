/**
 * Vue 组件库文档配置示例
 */

// 直接使用相对路径引用
import { defineConfig } from '../../dist/index.js'
import { vueComponentPlugin } from '../../dist/index.js'
import { markdownPlugin } from '../../dist/index.js'
import { playgroundPlugin } from '../../dist/index.js'

export default defineConfig({
  sourceDir: './src',
  outputDir: './docs',

  plugins: [
    // Vue 组件解析
    vueComponentPlugin({
      include: '**/*.vue',
      exclude: '**/node_modules/**',
    }),

    // Markdown 文档
    markdownPlugin({
      include: '**/*.md',
    }),

    // Playground 交互示例
    playgroundPlugin({
      frameworks: ['vue'],
      editorTheme: 'vs-light',
    }),
  ],

  site: {
    title: 'Vue 组件库',
    description: '一个优秀的 Vue 组件库文档示例',
    lang: 'zh-CN',
    darkMode: true,
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/ldesign/ldesign',
      },
    ],
  },

  theme: {
    name: 'default',
    styles: {
      primaryColor: '#42b883',
    },
  },

  navigation: {
    sidebar: 'auto',
    topbar: [
      { text: '首页', link: '/' },
      { text: '组件', link: '/components/' },
      { text: 'API', link: '/api/' },
    ],
    breadcrumb: true,
    toc: true,
  },
})



