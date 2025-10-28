# 🚀 快速开始重构 - 第一周任务清单

## 📅 本周目标
完成基础设施搭建，为 SPA 模式打好地基，**不影响任何现有功能**。

---

## ✅ 已完成的文件

```bash
# 这些文件已经创建好了
src/types/modes.ts              # ✅ 运行模式类型
src/app/index.ts                # ✅ Vue 应用入口
src/app/router.ts               # ✅ 路由系统
src/app/store.ts                # ✅ 状态管理
REFACTORING_PLAN.md             # ✅ 完整重构计划
```

---

## 📝 今天就可以做的事（2-3小时）

### 任务 1: 安装依赖

```bash
# 安装 Vue Router
pnpm add vue-router@latest

# 确保其他依赖已安装
pnpm install
```

### 任务 2: 创建全局组件注册

创建文件 `src/app/components.ts`:

```typescript
/**
 * 全局组件注册
 * 自动注册 VitePress 主题的所有组件
 */

import type { App } from 'vue'
import { defineAsyncComponent } from 'vue'

/**
 * 注册全局组件
 */
export function setupGlobalComponents(app: App): void {
  // VitePress 主题组件
  const themeComponents = import.meta.glob(
    '../../templates/vitepress-default/components/*.vue',
    { eager: false }
  )
  
  for (const path in themeComponents) {
    const componentName = path
      .split('/')
      .pop()!
      .replace('.vue', '')
    
    app.component(
      componentName,
      defineAsyncComponent(themeComponents[path] as any)
    )
  }
  
  // 布局组件
  const layoutComponents = import.meta.glob(
    '../../templates/vitepress-default/layouts/*.vue',
    { eager: false }
  )
  
  for (const path in layoutComponents) {
    const componentName = 'Layout' + path
      .split('/')
      .pop()!
      .replace('.vue', '')
    
    app.component(
      componentName,
      defineAsyncComponent(layoutComponents[path] as any)
    )
  }
  
  console.log('[App] Global components registered')
}
```

### 任务 3: 创建应用入口 HTML

创建文件 `templates/index.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="LDesign 文档站点">
  <title>文档站点</title>
  
  <!-- 基础样式 -->
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    #app {
      min-height: 100vh;
    }
    
    /* 加载动画 */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-size: 1.2rem;
      color: #666;
    }
  </style>
  
  <!-- 注入站点配置 -->
  <script>
    window.__DOCS_CONFIG__ = {
      siteConfig: {
        title: '文档站点',
        description: 'LDesign 文档生成器',
        lang: 'zh-CN',
        darkMode: true,
      },
      themeConfig: {
        name: 'default',
      },
      routes: [],
      isDev: true,
    }
  </script>
</head>
<body>
  <div id="app">
    <div class="loading">加载中...</div>
  </div>
  
  <!-- Vue 应用入口 -->
  <script type="module" src="/src/app/index.ts"></script>
</body>
</html>
```

### 任务 4: 创建文档模板组件

创建文件 `src/templates/api-doc.vue`:

```vue
<template>
  <div class="api-doc">
    <h1>{{ doc.name }}</h1>
    
    <div class="api-content">
      <!-- API 签名 -->
      <div v-if="doc.content.signatures" class="signatures">
        <h2>签名</h2>
        <div v-for="(sig, i) in doc.content.signatures" :key="i" class="signature">
          <code>{{ formatSignature(sig) }}</code>
        </div>
      </div>
      
      <!-- 参数 -->
      <div v-if="doc.content.parameters?.length" class="parameters">
        <h2>参数</h2>
        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>必填</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="param in doc.content.parameters" :key="param.name">
              <td><code>{{ param.name }}</code></td>
              <td><code>{{ param.type.name }}</code></td>
              <td>{{ param.optional ? '否' : '是' }}</td>
              <td>{{ param.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 返回值 -->
      <div v-if="doc.content.returnType" class="return-type">
        <h2>返回值</h2>
        <p><code>{{ doc.content.returnType.name }}</code></p>
      </div>
      
      <!-- 示例 -->
      <div v-if="doc.content.examples?.length" class="examples">
        <h2>示例</h2>
        <div v-for="(example, i) in doc.content.examples" :key="i" class="example">
          <h3 v-if="example.title">{{ example.title }}</h3>
          <pre><code>{{ example.code }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { APIDocNode } from '../types'

const props = defineProps<{
  doc: APIDocNode
}>()

function formatSignature(sig: any): string {
  const params = sig.parameters?.map((p: any) => 
    `${p.name}${p.optional ? '?' : ''}: ${p.type.name}`
  ).join(', ') || ''
  
  return `${sig.name}(${params}): ${sig.returnType.name}`
}
</script>

<style scoped>
.api-doc {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2c3e50;
}

h2 {
  font-size: 1.75rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #2c3e50;
  border-bottom: 2px solid #42b983;
  padding-bottom: 0.5rem;
}

code {
  background: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Fira Code', monospace;
  font-size: 0.875em;
}

pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1.25rem;
  border-radius: 6px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #ddd;
}

th {
  background: #f4f4f4;
  font-weight: 600;
}

.signature {
  margin: 0.5rem 0;
  padding: 1rem;
  background: #f9f9f9;
  border-left: 4px solid #42b983;
}
</style>
```

创建文件 `src/templates/component-doc.vue`:

```vue
<template>
  <div class="component-doc">
    <h1>{{ doc.name }}</h1>
    
    <p v-if="doc.content.description" class="description">
      {{ doc.content.description }}
    </p>
    
    <!-- Props -->
    <div v-if="doc.content.props?.length" class="props">
      <h2>Props</h2>
      <table>
        <thead>
          <tr>
            <th>属性</th>
            <th>类型</th>
            <th>必填</th>
            <th>默认值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prop in doc.content.props" :key="prop.name">
            <td><code>{{ prop.name }}</code></td>
            <td><code>{{ formatType(prop.type) }}</code></td>
            <td>{{ prop.required ? '是' : '否' }}</td>
            <td><code v-if="prop.defaultValue">{{ prop.defaultValue }}</code></td>
            <td>{{ prop.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Events -->
    <div v-if="doc.content.events?.length" class="events">
      <h2>Events</h2>
      <table>
        <thead>
          <tr>
            <th>事件</th>
            <th>参数</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in doc.content.events" :key="event.name">
            <td><code>{{ event.name }}</code></td>
            <td>
              <code v-if="event.parameters">
                {{ event.parameters.map((p: any) => p.name).join(', ') }}
              </code>
            </td>
            <td>{{ event.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Slots -->
    <div v-if="doc.content.slots?.length" class="slots">
      <h2>Slots</h2>
      <table>
        <thead>
          <tr>
            <th>插槽</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slot in doc.content.slots" :key="slot.name">
            <td><code>{{ slot.name }}</code></td>
            <td>{{ slot.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 示例 -->
    <div v-if="doc.content.examples?.length" class="examples">
      <h2>示例</h2>
      <div v-for="(example, i) in doc.content.examples" :key="i">
        <h3 v-if="example.title">{{ example.title }}</h3>
        <pre><code>{{ example.code }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentDocNode } from '../types'

defineProps<{
  doc: ComponentDocNode
}>()

function formatType(type: any): string {
  return typeof type === 'string' ? type : type.name || 'any'
}
</script>

<style scoped>
/* 复用 api-doc.vue 的样式 */
@import './api-doc.vue';
</style>
```

创建文件 `src/pages/404.vue`:

```vue
<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面未找到</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
}

h1 {
  font-size: 6rem;
  color: #42b983;
  margin-bottom: 1rem;
}

p {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 2rem;
}

a {
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
}

a:hover {
  background: #33a06f;
}
</style>
```

---

## 🧪 测试新代码

创建测试文件 `__tests__/app/router.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { generateRoutesFromDocs } from '../../src/app/router'
import type { DocNode } from '../../src/types'

describe('Router', () => {
  it('should generate routes from docs', () => {
    const docs: DocNode[] = [
      {
        type: 'markdown',
        name: 'Getting Started',
        path: 'guide/getting-started.md',
        outputPath: 'guide/getting-started.html',
        metadata: {},
        content: {},
      },
    ]
    
    const routes = generateRoutesFromDocs(docs)
    
    expect(routes).toHaveLength(2) // 文档 + 404
    expect(routes[0].path).toBe('/guide/getting-started')
    expect(routes[0].name).toBe('Getting Started')
  })
})
```

运行测试:

```bash
pnpm test
```

---

## 📊 验证进度

完成后，检查以下文件:

```bash
# 应该有这些新文件
✅ src/types/modes.ts
✅ src/app/index.ts
✅ src/app/router.ts
✅ src/app/store.ts
✅ src/app/components.ts          # 今天新增
✅ templates/index.html            # 今天新增
✅ src/templates/api-doc.vue       # 今天新增
✅ src/templates/component-doc.vue # 今天新增
✅ src/pages/404.vue              # 今天新增
✅ __tests__/app/router.test.ts   # 今天新增
```

---

## 🎯 明天的任务

1. 创建路由数据生成器 (`src/app/route-data-generator.ts`)
2. 创建 Vite 虚拟模块插件 (`src/vite/plugins/route-data.ts`)
3. 开始重写 `dev` 命令

---

## ❓ 常见问题

### Q: 这些改动会影响现有功能吗？
**A**: 不会！这些都是新增文件，完全不影响现有的 `generate` 和 `build` 命令。

### Q: 什么时候可以看到效果？
**A**: 完成第二阶段（Dev 模式重构）后，大约 2 周后可以运行 `ldesign-docs dev` 看到 SPA 效果。

### Q: 如果中途要回退怎么办？
**A**: 只需删除 `src/app` 目录和新增文件即可，零风险。

---

## 🎉 完成标志

当你完成今天的任务后：

- [ ] 所有新文件已创建
- [ ] `pnpm test` 测试通过
- [ ] `pnpm typecheck` 类型检查通过
- [ ] `pnpm build` 构建成功

恭喜！基础设施的第一步完成了！🎊
