<template>
  <button 
    :class="['btn', `btn-${type}`, `btn-${size}`]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
/**
 * Button 组件
 * 
 * 基础按钮组件，支持多种类型和尺寸
 */

interface Props {
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'danger' | 'success'
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
})

const emit = defineEmits<{
  /** 点击事件 */
  click: [event: MouseEvent]
  /** 双击事件 */
  dblclick: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-default {
  background: #ecf0f1;
  color: #333;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-success {
  background: #2ecc71;
  color: white;
}

.btn-small {
  font-size: 12px;
  padding: 4px 8px;
}

.btn-medium {
  font-size: 14px;
  padding: 8px 16px;
}

.btn-large {
  font-size: 16px;
  padding: 12px 24px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>



