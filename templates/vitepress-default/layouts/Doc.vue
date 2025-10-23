<template>
  <div class="doc-layout">
    <article class="doc-content">
      <!-- 页面元数据 -->
      <div class="page-meta" v-if="frontmatter">
        <h1 class="page-title">{{ frontmatter.title }}</h1>
        <p v-if="frontmatter.description" class="page-description">
          {{ frontmatter.description }}
        </p>
        <div class="page-info">
          <span v-if="frontmatter.author" class="info-item">
            👤 {{ frontmatter.author }}
          </span>
          <span v-if="frontmatter.date" class="info-item">
            📅 {{ formatDate(frontmatter.date) }}
          </span>
          <span v-if="frontmatter.tags" class="info-item">
            🏷️ {{ frontmatter.tags.join(', ') }}
          </span>
        </div>
      </div>

      <!-- 主要内容 -->
      <div class="markdown-body">
        <slot />
      </div>

      <!-- 反馈组件 -->
      <Feedback v-if="showFeedback" />

      <!-- 评论组件 -->
      <Comments v-if="showComments" />

      <!-- 页脚导航 -->
      <DocFooter />
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Feedback from '../components/Feedback.vue'
import Comments from '../components/Comments.vue'
import DocFooter from '../components/DocFooter.vue'

interface Frontmatter {
  title?: string
  description?: string
  author?: string
  date?: string
  tags?: string[]
  feedback?: boolean
  comments?: boolean
}

const props = defineProps<{
  frontmatter?: Frontmatter
}>()

const showFeedback = computed(() => props.frontmatter?.feedback !== false)
const showComments = computed(() => props.frontmatter?.comments !== false)

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.doc-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.doc-content {
  background-color: var(--bg-color);
}

.page-meta {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.page-description {
  font-size: 1.25rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.dark .page-description {
  color: #999;
}

.page-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: #666;
}

.dark .page-info {
  color: #999;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.markdown-body {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .doc-layout {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-description {
    font-size: 1.125rem;
  }

  .page-info {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>

