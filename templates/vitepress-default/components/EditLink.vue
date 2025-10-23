<template>
  <a v-if="href" :href="href" class="edit-link" target="_blank" rel="noopener noreferrer">
    <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
      <path fill="currentColor"
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
    <span>{{ text }}</span>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  editLink: {
    pattern: string
    text: string
  }
}

const props = defineProps<Props>()

const href = computed(() => {
  if (!props.editLink?.pattern) return null

  // 获取当前页面路径
  const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '')

  // 替换模式中的 :path
  return props.editLink.pattern.replace(':path', path + '.md')
})

const text = computed(() => {
  return props.editLink?.text || '编辑此页'
})
</script>

<style scoped>
.edit-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.dark .edit-link {
  color: #999;
}

.edit-link:hover {
  color: #42b983;
}

.icon {
  flex-shrink: 0;
}
</style>

