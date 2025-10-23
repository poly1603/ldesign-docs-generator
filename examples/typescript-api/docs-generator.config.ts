/**
 * TypeScript API 文档配置示例
 */

import { defineConfig, typedocPlugin, markdownPlugin } from '@ldesign/docs-generator'

export default defineConfig({
  sourceDir: './src',
  outputDir: './docs',

  plugins: [
    typedocPlugin({
      tsconfig: './tsconfig.json',
      entryPoints: ['./src/index.ts'],
      includePrivate: false,
    }),

    markdownPlugin({
      include: '**/*.md',
    }),
  ],

  site: {
    title: 'TypeScript API 文档',
    description: 'TypeScript API 文档生成示例',
  },
})



