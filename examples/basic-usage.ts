/**
 * 基础使用示例
 */

import {
  DocsGenerator,
  defineConfig,
  typedocPlugin,
  vueComponentPlugin,
  markdownPlugin,
} from '../src'

// 定义配置
const config = defineConfig({
  sourceDir: './example-src',
  outputDir: './example-docs',

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

  site: {
    title: '示例文档',
    description: '这是一个示例文档站点',
    lang: 'zh-CN',
    darkMode: true,
  },

  theme: {
    name: 'default',
  },

  navigation: {
    sidebar: 'auto',
    topbar: [
      { text: '首页', link: '/' },
      { text: 'API', link: '/api/' },
      { text: '组件', link: '/components/' },
    ],
  },
})

// 创建生成器
const generator = new DocsGenerator(config)

// 生成文档
async function main() {
  try {
    console.log('开始生成文档...')
    await generator.generate()
    console.log('文档生成完成！')
  } catch (error) {
    console.error('生成失败:', error)
    process.exit(1)
  }
}

// 只在直接运行时执行
if (require.main === module) {
  main()
}

export { config, generator }




