# Button 按钮

按钮用于触发一个操作。

## 基础用法

基本的按钮用法。

```vue
<template>
  <div>
    <Button>默认按钮</Button>
    <Button type="primary">主要按钮</Button>
    <Button type="success">成功按钮</Button>
    <Button type="warning">警告按钮</Button>
    <Button type="danger">危险按钮</Button>
  </div>
</template>

<script setup>
import { Button } from '@ldesign/components'
</script>
```

## 按钮尺寸

提供三种尺寸的按钮。

```vue
<template>
  <div>
    <Button size="small">小按钮</Button>
    <Button size="medium">中按钮</Button>
    <Button size="large">大按钮</Button>
  </div>
</template>
```

## 禁用状态

按钮不可用状态。

```vue
<template>
  <div>
    <Button disabled>禁用按钮</Button>
    <Button type="primary" disabled>禁用主要按钮</Button>
  </div>
</template>
```

## 加载状态

点击按钮后进行数据加载操作，在按钮上显示加载状态。

```vue
<template>
  <div>
    <Button :loading="loading" @click="handleClick">
      {{ loading ? '加载中...' : '点击加载' }}
    </Button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Button } from '@ldesign/components'

const loading = ref(false)

const handleClick = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>
```

## 图标按钮

带图标的按钮可增强辨识度。

```vue
<template>
  <div>
    <Button icon="search">搜索</Button>
    <Button type="primary" icon="edit">编辑</Button>
    <Button type="danger" icon="delete">删除</Button>
    <Button icon="download" />
  </div>
</template>
```

## 按钮组

以按钮组的方式出现，常用于多项类似操作。

```vue
<template>
  <ButtonGroup>
    <Button>左</Button>
    <Button>中</Button>
    <Button>右</Button>
  </ButtonGroup>
</template>

<script setup>
import { Button, ButtonGroup } from '@ldesign/components'
</script>
```

## API

### Button Props

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 按钮类型 | `string` | `default` / `primary` / `success` / `warning` / `danger` | `default` |
| size | 按钮尺寸 | `string` | `small` / `medium` / `large` | `medium` |
| disabled | 是否禁用 | `boolean` | - | `false` |
| loading | 是否加载中 | `boolean` | - | `false` |
| icon | 图标名称 | `string` | - | - |
| round | 是否圆角 | `boolean` | - | `false` |
| circle | 是否圆形 | `boolean` | - | `false` |

### Button Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击按钮时触发 | `(event: MouseEvent)` |

### Button Slots

| 名称 | 说明 |
|------|------|
| default | 按钮内容 |
| icon | 自定义图标 |

## TypeScript 类型

```typescript
import type { PropType } from 'vue'

export type ButtonType = 'default' | 'primary' | 'success' | 'warning' | 'danger'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface ButtonProps {
  /**
   * 按钮类型
   * @default 'default'
   */
  type?: ButtonType
  
  /**
   * 按钮尺寸
   * @default 'medium'
   */
  size?: ButtonSize
  
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  
  /**
   * 是否加载中
   * @default false
   */
  loading?: boolean
  
  /**
   * 图标名称
   */
  icon?: string
  
  /**
   * 是否圆角
   * @default false
   */
  round?: boolean
  
  /**
   * 是否圆形
   * @default false
   */
  circle?: boolean
}

export interface ButtonEmits {
  /**
   * 点击事件
   */
  (event: 'click', e: MouseEvent): void
}
```

## 样式变量

可以通过 CSS 变量自定义按钮样式。

```css
:root {
  /* 默认按钮 */
  --button-default-color: #333;
  --button-default-bg: #fff;
  --button-default-border: #dcdfe6;
  
  /* 主要按钮 */
  --button-primary-color: #fff;
  --button-primary-bg: #409eff;
  --button-primary-border: #409eff;
  
  /* 尺寸 */
  --button-small-height: 28px;
  --button-medium-height: 36px;
  --button-large-height: 44px;
  
  /* 字体 */
  --button-font-size: 14px;
  --button-font-weight: 500;
  
  /* 圆角 */
  --button-border-radius: 4px;
}
```

## 无障碍访问

按钮组件遵循 WAI-ARIA 规范：

- 使用语义化的 `<button>` 元素
- 支持键盘导航（Enter/Space 触发点击）
- 禁用状态通过 `aria-disabled` 属性标识
- 加载状态通过 `aria-busy` 属性标识

```vue
<template>
  <Button
    :disabled="disabled"
    :loading="loading"
    :aria-label="ariaLabel"
  >
    {{ text }}
  </Button>
</template>
```

## 最佳实践

### 1. 合理使用按钮类型

- **Primary**: 用于主要操作（如提交、确认）
- **Default**: 用于次要操作（如取消、返回）
- **Danger**: 用于危险操作（如删除）

### 2. 保持一致性

在同一页面中，保持按钮尺寸和样式的一致性。

### 3. 避免过多主要按钮

一个操作区域通常只有一个主要按钮，避免多个主要按钮造成选择困难。

### 4. 提供加载反馈

对于耗时操作，使用 `loading` 状态提供视觉反馈。

### 5. 合理使用图标

图标应该能够增强按钮的识别度，避免使用不熟悉的图标。

## 相关组件

- [ButtonGroup 按钮组](#)
- [Link 链接](#)
- [Dropdown 下拉菜单](#)
