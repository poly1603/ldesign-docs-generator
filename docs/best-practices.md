# 最佳实践指南

## 📝 文档编写

### 1. TSDoc 注释规范

**良好的注释**:
```typescript
/**
 * 计算数组的平均值
 * 
 * @param numbers - 数字数组
 * @returns 平均值
 * @throws 当数组为空时抛出错误
 * 
 * @example
 * ```ts
 * const avg = average([1, 2, 3, 4, 5])
 * console.log(avg) // 3
 * ```
 * 
 * @example
 * ```ts
 * // 处理空数组
 * try {
 *   average([])
 * } catch (error) {
 *   console.error(error.message)
 * }
 * ```
 * 
 * @since 1.0.0
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('数组不能为空')
  }
  
  const sum = numbers.reduce((a, b) => a + b, 0)
  return sum / numbers.length
}
```

**要点**:
- ✅ 提供清晰的描述
- ✅ 文档化所有参数和返回值
- ✅ 包含使用示例
- ✅ 说明异常情况
- ✅ 标注版本信息

### 2. Vue 组件文档

**良好的组件文档**:
```vue
<template>
  <div class="card" :class="variant">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
/**
 * Card 卡片组件
 * 
 * 用于展示内容的容器组件，支持多种样式变体
 * 
 * @example
 * ```vue
 * <Card variant="primary">
 *   <h3>标题</h3>
 *   <p>内容</p>
 * </Card>
 * ```
 */

interface Props {
  /** 
   * 卡片变体
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>
```

**要点**:
- ✅ 组件级注释说明用途
- ✅ Props 使用 TypeScript 类型
- ✅ 为每个 Prop 添加注释
- ✅ 提供默认值
- ✅ 包含使用示例

### 3. React 组件文档

**良好的组件文档**:
```typescript
/**
 * Alert 提示组件
 * 
 * 用于显示重要的提示信息
 * 
 * @example
 * ```tsx
 * <Alert type="success" closable onClose={handleClose}>
 *   操作成功！
 * </Alert>
 * ```
 */
export interface AlertProps {
  /** 提示类型 */
  type?: 'info' | 'success' | 'warning' | 'error'
  /** 是否可关闭 */
  closable?: boolean
  /** 关闭时的回调 */
  onClose?: () => void
  /** 子元素 */
  children?: React.ReactNode
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  closable = false,
  onClose,
  children,
}) => {
  // ...
}
```

## 🔌 插件使用

### 1. 选择合适的插件

根据项目类型选择插件：

**TypeScript 项目**:
```typescript
plugins: [
  typedocPlugin({
    tsconfig: './tsconfig.json',
    entryPoints: ['./src/index.ts'],
  }),
]
```

**Vue 项目**:
```typescript
plugins: [
  vueComponentPlugin({
    include: '**/*.vue',
  }),
  markdownPlugin({
    include: '**/*.md',
  }),
]
```

**React 项目**:
```typescript
plugins: [
  reactComponentPlugin({
    include: '**/*.{tsx,jsx}',
  }),
]
```

### 2. 插件组合

合理组合插件以获得最佳效果：

```typescript
plugins: [
  // 解析器插件
  typedocPlugin(),
  vueComponentPlugin(),
  
  // 增强插件
  mermaidPlugin({ theme: 'dark' }),
  katexPlugin({ inlineMath: true }),
  mediaPlugin({ lazyLoading: true }),
  
  // 集成插件
  playgroundPlugin({ frameworks: ['vue'] }),
  algoliaPlugin({
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_API_KEY',
    indexName: 'docs',
  }),
]
```

## 🎨 主题定制

### 1. 选择合适的主题

根据文档类型选择主题：

- **modern**: 现代化风格，适合大多数项目
- **minimal**: 极简风格，适合博客和文章
- **docs**: VitePress 风格，适合文档站点
- **api**: API 文档专用，三栏布局
- **component**: 组件展示专用，突出示例

### 2. 自定义样式

```typescript
theme: {
  name: 'modern',
  styles: {
    primaryColor: '#6366f1',
    fontFamily: 'Inter, sans-serif',
    sidebarWidth: '300px',
  },
}
```

### 3. 创建自定义主题

```bash
# 使用 CLI 创建主题
npx ldesign-docs theme create my-theme

# 或基于现有主题
npx ldesign-docs theme create my-theme --template modern
```

## ⚡ 性能优化

### 1. 启用增量构建

```typescript
// 默认已启用，确保配置正确
{
  cacheDir: '.cache/docs-generator',
  // 增量解析会自动启用
}
```

### 2. 排除不必要的文件

```typescript
plugins: [
  vueComponentPlugin({
    include: 'src/components/**/*.vue',
    exclude: [
      '**/node_modules/**',
      '**/*.test.vue',
      '**/__tests__/**',
    ],
  }),
]
```

### 3. 调整并发度

```typescript
// 在 ParserSystem 中调整
{
  concurrency: 8, // 根据 CPU 核心数调整
}
```

### 4. 使用构建优化

```bash
# 生产构建会自动优化
npx ldesign-docs build
```

## 📦 部署

### 1. 静态站点托管

生成的文档是纯静态站点，可以部署到：

- Vercel
- Netlify
- GitHub Pages
- CloudFlare Pages

### 2. 配置基础路径

```typescript
site: {
  base: '/my-docs/', // 子路径部署
}
```

### 3. 生成 sitemap

```bash
# 使用 sitemap 插件（需要自己实现或等待官方提供）
```

## 🔍 搜索优化

### 1. 使用本地搜索

默认使用 MiniSearch：

```typescript
// 无需额外配置，自动生成搜索索引
```

### 2. 使用 Algolia

```typescript
plugins: [
  algoliaPlugin({
    appId: process.env.ALGOLIA_APP_ID,
    apiKey: process.env.ALGOLIA_API_KEY,
    indexName: 'docs',
  }),
]
```

### 3. 优化搜索内容

- 在 frontmatter 中添加 tags
- 提供清晰的标题
- 编写有意义的描述

## 🧪 测试文档

### 1. 预览文档

```bash
npx ldesign-docs generate --watch
npx ldesign-docs serve --open
```

### 2. 检查链接

确保所有内部链接正确。

### 3. 测试响应式

在不同设备上测试文档站点。

## 📊 监控和分析

### 1. 启用性能监控

```typescript
// 在构建时启用
{
  performanceMonitoring: true,
}
```

### 2. 使用 Analytics

在 site 配置中添加自定义 head：

```typescript
site: {
  head: [
    {
      tag: 'script',
      attrs: {
        async: 'true',
        src: 'https://www.googletagmanager.com/gtag/js?id=GA_ID',
      },
    },
  ],
}
```

## 🔄 CI/CD 集成

### GitHub Actions 示例

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      
      - run: npx ldesign-docs build
      
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

## 💡 提示和技巧

### 1. 使用监听模式

开发时使用监听模式自动重新生成：

```bash
npx ldesign-docs generate --watch
```

### 2. 调试日志

启用详细日志查看详细信息：

```bash
npx ldesign-docs generate --log-level debug
```

### 3. 清理缓存

遇到问题时清理缓存：

```bash
npx ldesign-docs clean
rm -rf .cache/docs-generator
```

### 4. 版本管理

为不同版本生成文档：

```bash
# 生成当前版本
npx ldesign-docs build

# 归档到版本目录
mv docs docs-v2.0.0
```

## 🚀 高级技巧

### 1. 自定义插件

创建项目特定的插件：

```typescript
// plugins/custom.ts
export function customPlugin(): DocsPlugin {
  return {
    name: 'custom',
    version: '1.0.0',
    // 实现自定义逻辑
  }
}
```

### 2. 自定义模板辅助函数

```typescript
import { registerTemplateHelpers } from '@ldesign/docs-generator'

registerTemplateHelpers({
  formatCurrency: (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(value)
  },
})
```

### 3. 多语言支持

```typescript
// 为不同语言生成文档
const languages = ['zh-CN', 'en-US']

for (const lang of languages) {
  const generator = new DocsGenerator({
    sourceDir: `./src/${lang}`,
    outputDir: `./docs/${lang}`,
    site: {
      lang,
      title: lang === 'zh-CN' ? '文档' : 'Documentation',
    },
  })
  
  await generator.generate()
}
```

## 📚 推荐资源

- [TypeDoc 文档](https://typedoc.org/)
- [TSDoc 规范](https://tsdoc.org/)
- [VitePress 指南](https://vitepress.dev/)
- [Storybook 最佳实践](https://storybook.js.org/docs/react/writing-docs/introduction)

---

**持续改进你的文档！** 📖


