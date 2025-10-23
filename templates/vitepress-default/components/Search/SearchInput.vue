<template>
  <div class="search-input-container">
    <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20">
      <path fill="currentColor"
        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>

    <input ref="inputRef" v-model="localValue" type="text" class="search-input" placeholder="搜索文档... (Ctrl+K)"
      @input="handleInput" @keydown.esc="$emit('close')" />

    <button v-if="localValue" class="clear-btn" @click="clear">
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path fill="currentColor"
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    </button>

    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'close'): void
}>()

const inputRef = ref<HTMLInputElement>()
const localValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  localValue.value = val
})

function handleInput() {
  emit('update:modelValue', localValue.value)
  emit('search', localValue.value)
}

function clear() {
  localValue.value = ''
  emit('update:modelValue', '')
  emit('search', '')
  inputRef.value?.focus()
}

defineExpose({
  focus: () => inputRef.value?.focus(),
})
</script>

<style scoped>
.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  gap: 0.75rem;
}

.search-icon {
  color: #666;
  flex-shrink: 0;
}

.dark .search-icon {
  color: #999;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-color);
  font-size: 1.125rem;
  font-weight: 500;
}

.search-input::placeholder {
  color: #999;
}

.clear-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
  flex-shrink: 0;
}

.dark .clear-btn {
  background: rgba(255, 255, 255, 0.05);
  color: #999;
}

.clear-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000;
}

.dark .clear-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.loading-indicator {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 2px solid rgba(66, 185, 131, 0.3);
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
