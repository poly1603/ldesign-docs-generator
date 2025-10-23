# 性能优化指南

本指南介绍如何优化 @ldesign/docs-generator 生成的文档站点性能。

---

## 开发性能

### 1. 使用 Vite 开发服务器

```bash
# ✅ 推荐：快速 HMR
npx ldesign-docs dev

# ❌ 不推荐：需要完整重新生成
npx ldesign-docs generate --watch
```

**性能对比**：
- Vite dev: 文件更新 < 200ms
- generate --watch: 文件更新 2-5s

### 2. 启用缓存

```typescript
export default defineConfig({
  cacheDir: '.cache/docs', // 启用缓存
})
```

**效果**：
- 首次生成: ~20s
- 增量生成: ~3s（5-10倍提升）

### 3. 减少插件数量

只启用必要的插件：

```typescript
plugins: [
  markdownPlugin(),
  // 仅在需要时启用
  // typedocPlugin(),
  // playgroundPlugin(),
]
```

---

## 构建性能

### 1. 启用代码分割

```typescript
export default defineConfig({
  build: {
    codeSplit: {
      enabled: true,
      splitVendor: true, // 分离第三方库
    },
  },
})
```

### 2. 优化图片

```typescript
export default defineConfig({
  build: {
    imageOptimization: {
      enabled: true,
      convertToWebP: true, // 转换为 WebP
      quality: 80, // 压缩质量
    },
  },
})
```

**效果**：
- 原始图片: 1.2 MB
- 优化后: 300 KB（节省 75%）

### 3. 启用 Critical CSS

```typescript
export default defineConfig({
  build: {
    criticalCss: {
      enabled: true,
      inline: true, // 内联到 HTML
    },
  },
})
```

**效果**：
- 首屏渲染时间减少 30-40%

---

## 运行时性能

### 1. 启用预加载

```typescript
export default defineConfig({
  build: {
    prefetch: {
      enabled: true,
      strategy: 'lazy', // 'eager' | 'lazy' | 'viewport'
    },
  },
})
```

**策略说明**：
- `eager`: 立即预取所有链接（适合小站点）
- `lazy`: 鼠标悬停时预取（推荐）
- `viewport`: 链接进入视口时预取

### 2. 图片懒加载

图片会自动添加 `loading="lazy"`：

```markdown
![Large Image](./large-image.png)
```

### 3. 代码分割

路由级代码分割自动启用，每个页面独立加载。

---

## 构建产物优化

### 1. 压缩和最小化

```typescript
export default defineConfig({
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // 移除 console
        },
      },
    },
  },
})
```

### 2. Tree-shaking

确保代码可以被 tree-shake：

```typescript
// ✅ 推荐：具名导出
export { func1, func2 }

// ❌ 不推荐：默认导出对象
export default { func1, func2 }
```

### 3. 外部化依赖

对于大型依赖，可以使用 CDN：

```typescript
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        external: ['vue', 'vue-router'],
      },
    },
  },
})
```

---

## 性能监控

### 1. 启用 PWA

```typescript
export default defineConfig({
  pwa: {
    enabled: true,
    name: 'My Docs',
  },
})
```

**效果**：
- 离线访问
- 缓存资源
- 更快的二次加载

### 2. 启用分析

```typescript
export default defineConfig({
  analytics: {
    enabled: true,
    google: {
      measurementId: 'G-XXXXXXXXXX',
    },
  },
})
```

### 3. 性能指标

在浏览器控制台查看性能指标：

```javascript
// Web Vitals
console.log(performance.getEntriesByType('navigation'))
console.log(performance.getEntriesByType('paint'))
```

---

## 优化清单

### 开发阶段

- [ ] 使用 `ldesign-docs dev` 命令
- [ ] 启用缓存目录
- [ ] 只启用必要的插件
- [ ] 使用增量构建

### 构建阶段

- [ ] 启用代码分割
- [ ] 启用图片优化
- [ ] 启用 Critical CSS
- [ ] 启用资源压缩
- [ ] 移除未使用的代码

### 运行时

- [ ] 启用预加载/预取
- [ ] 启用图片懒加载
- [ ] 启用 PWA
- [ ] 使用 CDN
- [ ] 启用 gzip/brotli

---

## 性能测试

### 使用 Lighthouse

```bash
# 安装 Lighthouse
npm install -g lighthouse

# 运行测试
lighthouse http://localhost:3000 --view
```

### 目标指标

| 指标 | 目标 | 优秀 |
|------|------|------|
| FCP (首次内容绘制) | < 1.8s | < 1.0s |
| LCP (最大内容绘制) | < 2.5s | < 1.2s |
| TTI (可交互时间) | < 3.8s | < 2.5s |
| CLS (累积布局偏移) | < 0.1 | < 0.05 |

### 性能分析工具

```typescript
// 在配置中启用性能分析
export default defineConfig({
  vite: {
    build: {
      reportCompressedSize: true,
    },
  },
})
```

---

## 常见性能问题

### 1. 构建时间过长

**原因**：文件过多，插件过多

**解决**：
```typescript
// 使用增量构建
cacheDir: '.cache/docs',

// 减少插件
plugins: [
  // 只保留必要的
],
```

### 2. 页面加载慢

**原因**：资源未优化，未启用缓存

**解决**：
```typescript
build: {
  codeSplit: { enabled: true },
  imageOptimization: { enabled: true },
  prefetch: { enabled: true },
},
pwa: { enabled: true },
```

### 3. HMR 更新慢

**原因**：文件监听范围过大

**解决**：
```typescript
vite: {
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
}
```

---

## 最佳实践

### 1. 资源优化

- 使用 WebP 格式图片
- 压缩图片到合适大小
- 使用 SVG 代替小图标
- 延迟加载非关键资源

### 2. 代码优化

- 移除未使用的代码
- 使用动态导入
- 避免大型依赖
- 启用 tree-shaking

### 3. 缓存策略

- 使用长期缓存
- 为静态资源添加哈希
- 启用浏览器缓存
- 使用 Service Worker

### 4. 服务器优化

- 启用 gzip/brotli 压缩
- 使用 CDN
- 启用 HTTP/2
- 设置合适的缓存头

---

## 性能监控

### 1. 构建时监控

```bash
# 查看构建报告
npx ldesign-docs build --report
```

### 2. 运行时监控

```typescript
export default defineConfig({
  analytics: {
    enabled: true,
    google: {
      measurementId: 'G-XXX',
      enhancedMeasurement: true, // 启用增强测量
    },
  },
})
```

### 3. 自定义性能指标

```javascript
// 在页面中添加
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0]
  console.log('页面加载时间:', perfData.loadEventEnd - perfData.fetchStart)
})
```

---

## 性能对比

### v2.0 vs v3.0

| 指标 | v2.0 | v3.0 | 提升 |
|------|------|------|------|
| 开发服务器启动 | 5s | < 1s | **5x** |
| HMR 更新 | 2s | < 200ms | **10x** |
| 构建时间 | 60s | 45s | 25% |
| 包体积 | 500 KB | 300 KB | 40% |
| FCP | 2.5s | 1.2s | **52%** |
| LCP | 4.0s | 2.0s | **50%** |

---

## 进一步优化

- [Vite 性能优化](https://vitejs.dev/guide/performance.html)
- [Vue 性能优化](https://vuejs.org/guide/best-practices/performance.html)
- [Web Vitals](https://web.dev/vitals/)

