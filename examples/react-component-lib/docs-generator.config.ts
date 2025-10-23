/**
 * React 组件库文档配置示例
 */

import { defineConfig, reactComponentPlugin, markdownPlugin, playgroundPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  sourceDir: './src',
  outputDir: './docs',

  plugins: [
    reactComponentPlugin({
      include: '**/*.{tsx,jsx}',
      exclude: '**/node_modules/**',
    }),

    markdownPlugin({
      include: '**/*.md',
    }),

    playgroundPlugin({
      frameworks: ['react'],
    }),
  ],

  site: {
    title: 'React 组件库',
    description: 'React 组件库文档示例',
    darkMode: true,
  },

  navigation: {
    sidebar: 'auto',
  },
})



