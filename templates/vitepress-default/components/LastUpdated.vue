<template>
  <div class="last-updated">
    <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
      <path fill="currentColor"
        d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </svg>
    <span class="label">{{ t('footer.last-updated') }}:</span>
    <time :datetime="isoDate" :title="fullDate">{{ relativeTime }}</time>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  timestamp: number
}

const props = defineProps<Props>()

const now = ref(Date.now())

const date = computed(() => new Date(props.timestamp))

const isoDate = computed(() => date.value.toISOString())

const fullDate = computed(() => {
  return date.value.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const relativeTime = computed(() => {
  const diff = now.value - props.timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years} 年前`
  if (months > 0) return `${months} 个月前`
  if (days > 0) return `${days} 天前`
  if (hours > 0) return `${hours} 小时前`
  if (minutes > 0) return `${minutes} 分钟前`
  return '刚刚'
})

function t(key: string): string {
  const translations: Record<string, string> = {
    'footer.last-updated': '最后更新',
  }
  return translations[key] || key
}

onMounted(() => {
  // 每分钟更新一次相对时间
  setInterval(() => {
    now.value = Date.now()
  }, 60000)
})
</script>

<style scoped>
.last-updated {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

.dark .last-updated {
  color: #999;
}

.icon {
  flex-shrink: 0;
}

.label {
  font-weight: 500;
}

time {
  color: #42b983;
}
</style>

