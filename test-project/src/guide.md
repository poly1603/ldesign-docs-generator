---
title: 快速开始指南
description: 了解如何快速开始使用测试工具库
author: LDesign Team
date: 2025-10-23
---

# 快速开始指南

欢迎使用测试工具库！这是一个功能丰富的工具集合。

## 安装

```bash
npm install test-toolkit
```

## 基础使用

### 数学运算

使用 `add` 和 `subtract` 函数进行基本的数学运算：

```typescript
import { add, subtract } from 'test-toolkit'

const sum = add(10, 5)        // 15
const diff = subtract(10, 5)  // 5
```

### 用户管理

使用 `UserManager` 类管理用户：

```typescript
import { UserManager } from 'test-toolkit'

const manager = new UserManager()

manager.addUser({
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  age: 25
})

const user = manager.findUserById(1)
console.log(user?.name) // 'Alice'
```

## 组件使用

### Button 组件

基础按钮组件：

```vue
<template>
  <Button type="primary" size="large" @click="handleClick">
    点击我
  </Button>
</template>

<script setup>
import { Button } from 'test-toolkit'

function handleClick(event) {
  console.log('按钮被点击了')
}
</script>
```

## 特性

- ✅ TypeScript 完整支持
- ✅ Vue 3 组件
- ✅ 完整的类型定义
- ✅ 详细的文档

## 更多资源

- [API 文档](/api/)
- [组件文档](/components/)
- [GitHub](https://github.com/example/test-toolkit)



