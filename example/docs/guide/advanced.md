# 进阶指南

本指南介绍 LDesign Docs Generator 的高级功能和最佳实践。

## 自动 API 文档生成

从 TypeScript 源码自动生成 API 文档。

### 配置源码目录

```javascript
// docs-generator.config.js
export default {
  srcDir: './src',  // 源码目录
  docsDir: './docs', // 文档目录
}
```

### 编写 JSDoc 注释

```typescript
/**
 * 创建一个新的实例
 * 
 * @param options - 配置选项
 * @returns 实例对象
 * 
 * @example
 * ```typescript
 * const instance = createInstance({
 *   name: 'my-app',
 *   version: '1.0.0'
 * })
 * ```
 * 
 * @public
 */
export function createInstance(options: InstanceOptions): Instance {
  // 实现...
}
```

### 支持的 JSDoc 标签

- `@param` - 参数说明
- `@returns` / `@return` - 返回值说明
- `@example` - 使用示例
- `@see` - 相关链接
- `@deprecated` - 标记为废弃
- `@since` - 添加的版本
- `@public` / `@private` - 可见性
- `@throws` - 可能抛出的错误

## 组件文档

为 Vue/React 组件生成文档。

### Vue 组件

```vue
<script setup lang="ts">
/**
 * Button 组件
 * 
 * @component
 */

interface Props {
  /**
   * 按钮类型
   * @default 'default'
   */
  type?: 'primary' | 'default' | 'dashed'
  
  /**
   * 按钮大小
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large'
  
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
})

/**
 * 点击事件
 * @event click
 */
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>
```

### React 组件

```typescript
import { FC, MouseEvent } from 'react'

/**
 * Button 组件属性
 */
interface ButtonProps {
  /**
   * 按钮类型
   * @default 'default'
   */
  type?: 'primary' | 'default' | 'dashed'
  
  /**
   * 按钮大小
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large'
  
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  
  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

/**
 * Button 组件
 * 
 * @component
 * 
 * @example
 * ```tsx
 * <Button type="primary" size="large">
 *   Click me
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({
  type = 'default',
  size = 'medium',
  disabled = false,
  onClick,
  children,
}) => {
  // 实现...
}
```

## Markdown 扩展

### 自定义容器

使用自定义容器突出显示内容：

::: tip 提示
这是一条**提示**信息，用于提供有用的建议。
:::

::: warning 警告
这是一条**警告**信息，需要用户注意。
:::

::: danger 危险
这是一条**危险**信息，表示重要的警告。
:::

::: details 点击查看详情
这里是折叠的详细内容。

可以包含多行和代码块：

\`\`\`typescript
console.log('Hello World')
\`\`\`
:::

**Markdown 源码**：

```markdown
::: tip 提示
这是一条提示信息
:::

::: warning 警告
这是一条警告信息
:::

::: danger 危险
这是一条危险信息
:::

::: details 点击查看详情
折叠的内容
:::
```

### 代码组

展示多个代码示例：

::: code-group

```typescript [TypeScript]
interface User {
  id: number
  name: string
}

const user: User = {
  id: 1,
  name: 'Alice'
}
```

```javascript [JavaScript]
const user = {
  id: 1,
  name: 'Alice'
}
```

```json [JSON]
{
  "id": 1,
  "name": "Alice"
}
```

:::

### 代码高亮

支持语法高亮和行号：

```typescript {2,4-6}
// 第 2 行和第 4-6 行会被高亮
function hello(name: string) {
  return `Hello, ${name}!`
}

const result = hello('World')
console.log(result)
```

### 导入代码片段

从文件导入代码：

```markdown
<<< @/src/components/Button.ts
```

## 搜索功能

### 启用搜索

```javascript
// docs-generator.config.js
export default {
  search: true,
}
```

### 配置搜索选项

```javascript
export default {
  search: {
    provider: 'local', // 或 'algolia'
    
    // 本地搜索配置
    options: {
      miniSearch: {
        searchOptions: {
          fuzzy: 0.2,
          prefix: true,
          boost: {
            title: 4,
            heading: 2,
            text: 1,
          },
        },
      },
    },
  },
}
```

### Algolia 搜索

```javascript
export default {
  search: {
    provider: 'algolia',
    options: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_API_KEY',
      indexName: 'YOUR_INDEX_NAME',
    },
  },
}
```

## 多版本文档

支持同时维护多个版本的文档。

### 配置版本

```javascript
// docs-generator.config.js
export default {
  versions: {
    current: '3.0',
    list: [
      { version: '3.0', label: 'v3.x', path: '/v3/' },
      { version: '2.0', label: 'v2.x', path: '/v2/' },
      { version: '1.0', label: 'v1.x', path: '/v1/', archived: true },
    ],
  },
}
```

### 目录结构

```
docs/
├── v3/           # 3.x 文档
│   ├── guide/
│   └── api/
├── v2/           # 2.x 文档
│   ├── guide/
│   └── api/
└── v1/           # 1.x 文档（已归档）
    ├── guide/
    └── api/
```

## 国际化 (i18n)

支持多语言文档。

### 配置语言

```javascript
// docs-generator.config.js
export default {
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
    },
  },
}
```

### 目录结构

```
docs/
├── zh/           # 中文文档
│   ├── guide/
│   └── api/
└── en/           # 英文文档
    ├── guide/
    └── api/
```

## 自定义插件

扩展构建流程。

### 创建插件

```typescript
import type { Plugin } from '@ldesign/docs-generator'

export function myPlugin(options = {}): Plugin {
  return {
    name: 'my-plugin',
    
    // 初始化
    async init() {
      console.log('插件初始化')
    },
    
    // 解析文档前
    async beforeParse(docs) {
      // 修改文档列表
      return docs
    },
    
    // 解析文档后
    async afterParse(docs) {
      // 处理解析结果
      return docs
    },
    
    // 构建前
    async beforeBuild(context) {
      console.log('开始构建')
    },
    
    // 构建后
    async afterBuild(context) {
      console.log('构建完成')
      // 生成额外文件
      await writeFile('custom.json', JSON.stringify(context))
    },
  }
}
```

### 使用插件

```javascript
// docs-generator.config.js
import { myPlugin } from './plugins/my-plugin'

export default {
  plugins: [
    myPlugin({
      // 插件选项
    }),
  ],
}
```

## 性能优化

### 代码分割

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue': ['vue', 'vue-router'],
          'markdown': ['markdown-it'],
        },
      },
    },
  },
}
```

### 图片优化

```javascript
export default {
  plugins: [
    imageOptimization({
      formats: ['webp', 'avif'],
      quality: 80,
    }),
  ],
}
```

### PWA 支持

```javascript
export default {
  plugins: [
    pwa({
      manifest: {
        name: 'LDesign Docs',
        short_name: 'Docs',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\./,
            handler: 'CacheFirst',
          },
        ],
      },
    }),
  ],
}
```

## 部署

### Vercel

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install"
}
```

### Netlify

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

### GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 最佳实践

### 文档组织

1. **清晰的结构** - 使用有意义的目录和文件名
2. **一致的风格** - 保持标题、术语、代码风格一致
3. **完整的导航** - 提供清晰的导航和面包屑
4. **搜索友好** - 使用描述性标题和关键词

### 代码示例

1. **可运行** - 确保代码示例可以直接运行
2. **完整** - 包含必要的导入和设置
3. **注释** - 添加必要的注释说明
4. **多样化** - 提供不同场景的示例

### 维护更新

1. **版本管理** - 为重大更新维护多版本文档
2. **变更日志** - 记录所有重要变更
3. **废弃提示** - 标记废弃的 API 并提供替代方案
4. **定期审查** - 定期审查和更新文档内容

## 故障排查

### 构建失败

检查以下问题：

1. **依赖安装** - 确保所有依赖已正确安装
2. **配置文件** - 检查配置文件语法
3. **文档格式** - 确保 Markdown 格式正确
4. **路径问题** - 检查文件路径是否正确

### 样式问题

1. **清除缓存** - 删除 `.temp` 目录
2. **重新构建** - 运行 `pnpm build` 重新构建
3. **浏览器缓存** - 清除浏览器缓存

### 搜索不工作

1. **配置检查** - 确保 `search: true`
2. **索引生成** - 检查构建日志确认索引已生成
3. **内容问题** - 确保文档有足够的内容用于索引

## 下一步

- 查看 [API 文档](/api/) 了解详细的 API 说明
- 浏览 [组件示例](/components/) 学习组件文档编写
- 访问 [GitHub](https://github.com/ldesign/ldesign) 查看源码
