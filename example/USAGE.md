# 示例使用说明

这个 `example/` 目录是一个完整的文档项目示例，展示了 `@ldesign/docs-generator` 的所有核心功能。

## 📂 目录结构

```
example/
├── .gitignore                     # Git 忽略文件
├── README.md                      # 详细说明文档
├── USAGE.md                       # 本文档
├── package.json                   # 项目配置
├── docs-generator.config.js       # 文档生成器配置（含详细注释）
│
├── docs/                          # 📚 文档源文件
│   ├── index.md                   # 🏠 首页
│   ├── guide/                     # 📖 指南文档
│   │   ├── getting-started.md     #   - 快速开始
│   │   └── advanced.md            #   - 进阶指南
│   ├── api/                       # 🔧 API 文档
│   │   └── core.md                #   - 核心 API
│   └── components/                # 🎨 组件文档
│       └── button.md              #   - Button 组件
│
└── src/                           # 💻 示例源代码
    ├── index.ts                   # 主入口（含完整 JSDoc）
    └── components/
        └── Button.ts              # Button 组件类

总计：11 个文件
```

## 🚀 快速开始

### 1️⃣ 开发模式

```bash
# 方法一：在项目根目录运行
cd D:\WorkBench\ldesign\tools\docs-generator
pnpm ldesign-docs dev --root ./example

# 方法二：在示例目录运行
cd example
pnpm dev
```

访问 **http://localhost:3000** 查看文档

**特性**：
- ⚡ 极速启动（< 1s）
- 🔥 热更新（< 200ms）
- 🚀 客户端路由
- 📝 自动路由生成

### 2️⃣ 构建文档

#### Hybrid 模式（推荐）

```bash
cd example
pnpm build
# 或
pnpm build:hybrid
```

**输出**：`dist/` 目录
- ✅ SPA 应用
- ✅ 预渲染页面（首页、404等）
- ✅ 搜索索引
- ✅ sitemap.xml、robots.txt

#### SPA 模式

```bash
pnpm build:spa
```

适合内网文档，不需要 SEO。

#### SSG 模式

```bash
pnpm build:ssg
# 或
pnpm generate
```

完全静态化，SEO 最佳。

### 3️⃣ 预览构建结果

```bash
pnpm preview
```

访问 **http://localhost:4173** 查看构建后的站点。

## 📝 示例内容

### 文档示例

| 文件 | 说明 | 亮点 |
|------|------|------|
| `docs/index.md` | 首页 | 使用 Frontmatter 配置布局 |
| `docs/guide/getting-started.md` | 快速开始 | 基础 Markdown 功能演示 |
| `docs/guide/advanced.md` | 进阶指南 | 高级功能（容器、代码组等） |
| `docs/api/core.md` | API 文档 | 手写 API 文档示例 |
| `docs/components/button.md` | 组件文档 | 组件文档完整示例 |

### 源码示例

| 文件 | 说明 | 亮点 |
|------|------|------|
| `src/index.ts` | 核心 API | 完整 JSDoc 注释，可自动生成文档 |
| `src/components/Button.ts` | Button 组件 | 类、接口、函数的文档化 |

## 🎨 配置亮点

`docs-generator.config.js` 展示了：

- ✅ 基础配置（标题、描述、语言）
- ✅ 目录配置（文档、源码、输出）
- ✅ 主题配置（导航、侧边栏、页脚）
- ✅ 功能配置（搜索、站点地图、暗黑模式）
- ✅ Markdown 配置（代码高亮、容器）
- ✅ 构建配置（预渲染路由、压缩）
- ✅ Vite 配置（服务器端口）

## 🧪 测试功能

这个示例可以用来测试：

### ✅ 开发体验
- [x] 快速启动
- [x] 热更新
- [x] 自动路由

### ✅ Markdown 功能
- [x] 基础语法（标题、列表、表格）
- [x] 代码高亮
- [x] 自定义容器（tip、warning、danger）
- [x] 代码组
- [x] Frontmatter

### ✅ 导航功能
- [x] 顶部导航
- [x] 侧边栏
- [x] 面包屑
- [x] 页内导航

### ✅ 构建功能
- [x] SPA 模式
- [x] SSG 模式
- [x] Hybrid 模式
- [x] 搜索索引
- [x] Sitemap

### ✅ API 文档生成
- [x] JSDoc 注释解析
- [x] 类型定义
- [x] 示例代码

## 💡 扩展示例

你可以在这个基础上添加更多内容：

### 添加新页面

```bash
# 创建新的指南页面
echo "# 配置指南" > docs/guide/configuration.md

# 创建新的 API 页面
echo "# Utils API" > docs/api/utils.md
```

路由会自动生成！

### 添加新组件文档

```bash
mkdir -p docs/components
echo "# Input 输入框" > docs/components/input.md
```

### 添加源码示例

```bash
# 创建新的工具函数
cat > src/utils.ts << 'EOF'
/**
 * 工具函数
 * @packageDocumentation
 */

/**
 * 合并对象
 * @param target - 目标对象
 * @param source - 源对象
 * @returns 合并后的对象
 */
export function merge<T>(target: T, source: Partial<T>): T {
  return { ...target, ...source }
}
EOF
```

## 🎓 学习路径

1. **查看 README.md** - 了解完整功能和使用方式
2. **运行 dev 命令** - 体验开发模式
3. **修改文档内容** - 体验热更新
4. **查看配置文件** - 学习所有配置选项
5. **运行 build 命令** - 测试构建功能
6. **阅读源码示例** - 学习如何编写可文档化的代码

## 📚 相关文档

- [完整迁移指南](../docs/MIGRATION.md)
- [最终交付报告](../FINAL_DELIVERY.md)
- [测试指南](../test-runner.md)
- [完成总结](../COMPLETION_SUMMARY.md)

## 🤝 贡献示例

如果你想为示例添加更多内容：

1. 添加新的 Markdown 功能演示
2. 添加更多源码示例
3. 添加插件使用示例
4. 添加部署配置示例

欢迎提交 PR！

---

**最后更新**: 2025-10-28  
**维护者**: LDesign Team
