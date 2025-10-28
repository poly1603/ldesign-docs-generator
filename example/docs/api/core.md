---
title: Core API
---

# Core API

核心 API 文档。

## defineConfig

定义配置的辅助函数。

**类型签名**:

```typescript
function defineConfig(config: DocsGeneratorOptions): DocsGeneratorOptions
```

**参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| config | DocsGeneratorOptions | 配置对象 |

**返回值**: DocsGeneratorOptions

**示例**:

```typescript
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  sourceDir: './docs',
  outputDir: './dist',
})
```

## createDocsGenerator

创建文档生成器实例。

```typescript
function createDocsGenerator(options: DocsGeneratorOptions): DocsGenerator
```

**示例**:

```typescript
import { createDocsGenerator } from '@ldesign/docs-generator'

const generator = createDocsGenerator({
  sourceDir: './docs',
  outputDir: './dist',
})

await generator.generate()
```
