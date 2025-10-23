/**
 * 测试项目文档生成配置
 */

import { defineConfig } from '../src'
import { typedocPlugin, vueComponentPlugin, markdownPlugin } from '../src'

export default defineConfig({
  // 源目录
  sourceDir: './src',
  
  // 输出目录
  outputDir: './docs-output',
  
  // 日志级别
  logLevel: 'debug',
  
  // 插件配置
  plugins: [
    // TypeScript API 文档
    typedocPlugin({
      tsconfig: './tsconfig.json',
      entryPoints: ['./src/index.ts'],
      includePrivate: false,
    }),
    
    // Vue 组件文档
    vueComponentPlugin({
      include: '**/*.vue',
    }),
    
    // Markdown 文档
    markdownPlugin({
      include: '**/*.md',
    }),
  ],
  
  // 站点配置
  site: {
    title: '测试工具库文档',
    description: '这是一个测试文档生成器的示例项目',
    lang: 'zh-CN',
    darkMode: true,
  },
  
  // 主题配置
  theme: {
    name: 'default',
    styles: {
      primaryColor: '#3498db',
      backgroundColor: '#ffffff',
      textColor: '#333333',
    },
  },
  
  // 导航配置
  navigation: {
    sidebar: 'auto',
    topbar: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide' },
      { text: 'API', link: '/api/' },
      { text: '组件', link: '/components/' },
    ],
  },
})



