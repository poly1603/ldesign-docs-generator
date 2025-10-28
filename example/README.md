# LDesign Docs Generator - 使用示例

这是一个完整的示例项目，展示了 `@ldesign/docs-generator` 的核心功能。

## 📁 项目结构

```
example/
├── README.md                      # 本文档
├── package.json                   # 项目配置
├── docs-generator.config.js       # 文档生成器配置
├── docs/                          # 文档源文件
│   ├── index.md                   # 首页
│   ├── guide/                     # 指南文档
│   │   ├── getting-started.md
│   │   └── advanced.md
│   ├── api/                       # API 文档
│   │   └── core.md
│   └── components/                # 组件文档
│       └── button.md
└── src/                           # 示例源代码
    ├── index.ts
    └── components/
        └── Button.ts
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 在项目根目录安装
cd ..
pnpm install

# 或在示例目录安装
cd example
pnpm install
```

### 2. 开发模式

启动 SPA 开发服务器（VitePress 风格）：

```bash
# 在项目根目录运行
pnpm ldesign-docs dev --root ./example

# 或在示例目录运行
cd example
pnpm dev
```

访问 http://localhost:3000 查看文档。

**特性**：
- ⚡ 极速启动（< 1s）
- 🔥 热更新（< 200ms）
- 🚀 客户端路由
- 📝 自动生成侧边栏和导航

### 3. 构建文档

#### 混合模式（推荐）

SPA + 预渲染关键页面：

```bash
pnpm ldesign-docs build --root ./example
# 或
pnpm build
```

输出到 `dist/` 目录，包含：
- SPA 应用
- 预渲染的首页、404 等
- 搜索索引
- sitemap.xml、robots.txt

#### SPA 模式

纯单页应用：

```bash
pnpm ldesign-docs build --mode spa --root ./example
```

适合内网文档或不需要 SEO 的场景。

#### SSG 模式（向后兼容）

纯静态 HTML：

```bash
pnpm ldesign-docs generate --root ./example
# 或
pnpm ldesign-docs build --mode ssg --root ./example
```

适合需要完全静态的场景。

## 📝 配置说明

查看 `docs-generator.config.js` 了解所有配置选项：

```javascript
export default {
  // 基础配置
  title: 'LDesign Docs Example',
  description: '展示所有核心功能',
  
  // 源目录
  docsDir: './docs',
  srcDir: './src',
  
  // 输出目录
  outDir: './dist',
  
  // 主题配置
  theme: {
    nav: [...],
    sidebar: {...},
  },
  
  // 功能配置
  search: true,
  sitemap: true,
  // ...
}
```

## 📚 文档编写

### Markdown 基础

支持 GFM（GitHub Flavored Markdown）和扩展语法：

```markdown
# 标题

正文内容

## 代码高亮

\`\`\`typescript
function hello() {
  console.log('Hello World')
}
\`\`\`

## 提示容器

::: tip 提示
这是一条提示信息
:::

::: warning 警告
这是一条警告信息
:::

::: danger 危险
这是一条危险信息
:::
```

### 自动 API 文档

从 TypeScript 源码自动生成：

```typescript
/**
 * 按钮组件
 * @example
 * ```tsx
 * <Button type="primary">点击</Button>
 * ```
 */
export class Button {
  /**
   * 按钮类型
   * @default 'default'
   */
  type?: 'primary' | 'default' | 'dashed'
}
```

## 🎨 自定义主题

在配置中自定义主题：

```javascript
export default {
  theme: {
    // 导航栏
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],
    
    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '进阶', link: '/guide/advanced' },
          ],
        },
      ],
    },
    
    // 自定义颜色
    colors: {
      primary: '#3eaf7c',
      accent: '#ff6b6b',
    },
  },
}
```

## 🔌 插件系统

扩展功能：

```javascript
export default {
  plugins: [
    // Google Analytics
    ['@ldesign/plugin-analytics', {
      ga: 'UA-XXXXXXXXX-X',
    }],
    
    // PWA 支持
    ['@ldesign/plugin-pwa', {
      serviceWorker: true,
    }],
    
    // 自定义插件
    {
      name: 'my-plugin',
      async afterBuild(context) {
        // 构建后处理
      },
    },
  ],
}
```

## 🧪 测试示例

运行测试验证功能：

```bash
# 单元测试
pnpm test

# 类型检查
pnpm typecheck

# 构建验证
pnpm build
```

## 📖 更多资源

- [完整文档](../docs/MIGRATION.md)
- [配置参考](../README.md)
- [迁移指南](../docs/MIGRATION.md)
- [API 文档](./docs/api/)

## 💡 提示

### 性能优化

1. **开发模式**: 使用 `dev` 命令获得最佳开发体验
2. **生产构建**: 使用 `build --mode hybrid` 获得最佳性能和 SEO
3. **静态托管**: 使用 `generate` 生成纯静态站点

### 常见问题

**Q: 如何添加新页面？**  
A: 在 `docs/` 目录下创建 `.md` 文件，路由会自动生成。

**Q: 如何自定义样式？**  
A: 在配置中设置 `theme.colors` 或创建自定义 CSS。

**Q: 如何部署？**  
A: 将 `dist/` 目录部署到任意静态托管服务（Vercel、Netlify、GitHub Pages 等）。

## 🎉 开始探索

现在运行 `pnpm dev` 开始体验吧！
