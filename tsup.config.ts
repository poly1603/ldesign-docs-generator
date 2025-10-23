import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  external: [
    '@ldesign/kit',
    'typedoc',
    '@vue/compiler-sfc',
    'markdown-it',
    'gray-matter',
    'doctrine',
    'glob',
    'fs-extra',
    'commander',
    'ejs',
    'minisearch',
    // 可选依赖
    'handlebars',
    'nunjucks',
    'algoliasearch',
    'codesandbox',
    '@stackblitz/sdk',
    'html-minifier-terser',
  ],
  shims: true,
  target: 'node18',
  treeshake: true,
})


