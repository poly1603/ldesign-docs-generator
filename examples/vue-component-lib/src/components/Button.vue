<template>
  <button :class="['btn', `btn-${type}`, `btn-${size}`, { 'btn-disabled': disabled }]" :disabled="disabled"
    @click="handleClick">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
/**
 * Button 按钮组件
 * 
 * 基础按钮组件，支持多种类型、尺寸和状态
 * 
 * @example
 * ```vue
 * <Button type="primary" size="medium">
 *   点击我
 * </Button>
 * ```
 */

interface Props {
  /** 按钮类型 */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
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
}>()

/**
 * 处理点击事件
 */
function handleClick(event: MouseEvent) {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:hover {
  opacity: 0.8;
}

.btn-primary {
  background-color: #42b883;
  color: #fff;
  border-color: #42b883;
}

.btn-success {
  background-color: #67c23a;
  color: #fff;
  border-color: #67c23a;
}

.btn-warning {
  background-color: #e6a23c;
  color: #fff;
  border-color: #e6a23c;
}

.btn-danger {
  background-color: #f56c6c;
  color: #fff;
  border-color: #f56c6c;
}

.btn-small {
  padding: 4px 12px;
  font-size: 12px;
}

.btn-large {
  padding: 12px 20px;
  font-size: 16px;
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>


