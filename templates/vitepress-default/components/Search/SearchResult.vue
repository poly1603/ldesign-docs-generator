<template>
  <a :href="result.url" class="search-result" :class="{ 'selected': selected }" @click.prevent="$emit('click')">
    <div class="result-header">
      <svg class="result-icon" viewBox="0 0 24 24" width="18" height="18">
        <path fill="currentColor"
          d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
      <h4 class="result-title" v-html="highlightMatch(result.title)"></h4>
      <span v-if="result.score" class="result-score">{{ (result.score * 100).toFixed(0) }}%</span>
    </div>

    <p v-if="result.excerpt" class="result-excerpt" v-html="highlightMatch(result.excerpt)"></p>

    <div class="result-meta">
      <span class="result-url">{{ result.url }}</span>
    </div>
  </a>
</template>

<script setup lang="ts">
import { inject } from 'vue'

interface SearchResult {
  id: string
  title: string
  url: string
  excerpt?: string
  score?: number
}

interface Props {
  result: SearchResult
  selected: boolean
}

const props = defineProps<Props>()
defineEmits<{
  (e: 'click'): void
}>()

const query = inject('searchQuery', '')

function highlightMatch(text: string): string {
  if (!query || !text) return text

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<style scoped>
.search-result {
  display: block;
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: var(--text-color);
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.search-result:hover,
.search-result.selected {
  background: rgba(66, 185, 131, 0.05);
  border-left-color: #42b983;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.result-icon {
  color: #42b983;
  flex-shrink: 0;
}

.result-title {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.result-title :deep(mark) {
  background: #42b983;
  color: white;
  padding: 0.125rem 0.25rem;
  border-radius: 2px;
}

.result-score {
  font-size: 0.75rem;
  color: #666;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
}

.dark .result-score {
  color: #999;
  background: rgba(255, 255, 255, 0.05);
}

.result-excerpt {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #666;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.dark .result-excerpt {
  color: #999;
}

.result-excerpt :deep(mark) {
  background: rgba(66, 185, 131, 0.2);
  color: #42b983;
  padding: 0.125rem 0.25rem;
  border-radius: 2px;
  font-weight: 500;
}

.result-meta {
  font-size: 0.75rem;
  color: #999;
}

.result-url {
  font-family: var(--vp-font-family-mono);
}
</style>
