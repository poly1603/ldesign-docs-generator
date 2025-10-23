<template>
  <div class="comments-section" v-if="enabled">
    <h3 class="comments-title">{{ title }}</h3>
    <div class="giscus-container" ref="giscusRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, watch } from 'vue'

interface Props {
  enabled?: boolean
  title?: string
  repo?: string
  repoId?: string
  category?: string
  categoryId?: string
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
  title: '评论',
  repo: 'ldesign/ldesign',
  repoId: '',
  category: 'General',
  categoryId: '',
})

const giscusRef = ref<HTMLElement>()
const isDark = inject('isDark', ref(false))

function loadGiscus() {
  if (!giscusRef.value || !props.enabled) return

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', props.repo)
  script.setAttribute('data-repo-id', props.repoId)
  script.setAttribute('data-category', props.category)
  script.setAttribute('data-category-id', props.categoryId)
  script.setAttribute('data-mapping', 'pathname')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', 'bottom')
  script.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  script.setAttribute('data-lang', 'zh-CN')
  script.setAttribute('crossorigin', 'anonymous')
  script.async = true

  giscusRef.value.appendChild(script)
}

// 监听主题变化
watch(isDark, (newValue) => {
  const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage(
      {
        giscus: {
          setConfig: {
            theme: newValue ? 'dark' : 'light',
          },
        },
      },
      'https://giscus.app'
    )
  }
})

onMounted(() => {
  loadGiscus()
})
</script>

<style scoped>
.comments-section {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.comments-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.giscus-container {
  min-height: 200px;
}
</style>

