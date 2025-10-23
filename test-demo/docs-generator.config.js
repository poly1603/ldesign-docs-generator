import { defineConfig } from '@ldesign/docs-generator'
import { typedocPlugin, vueComponentPlugin, markdownPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  // 源目录
  sourceDir: './src',
  
  // 输出目录
  outputDir: './docs',
  
  // 插件配置
  plugins: [
    typedocPlugin({
      tsconfig: './tsconfig.json',
    }),
    vueComponentPlugin({
      include: '**/*.vue',
    }),
    markdownPlugin({
      include: '**/*.md',
    }),
  ],
  
  // 站点配置
  site: {
    title: '文档站点',
    description: '自动生成的文档站点',
    lang: 'zh-CN',
    darkMode: true,
  },
  
  // 主题配置
  theme: {
    name: 'default',
  },
  
  // 导航配置
  navigation: {
    sidebar: 'auto',
    topbar: [
      { text: '首页', link: '/' },
      { text: 'API', link: '/api/' },
      { text: '组件', link: '/components/' },
    ],
  },
})
