<template>
  <div class="search-results">
    <div v-if="results.length === 0" class="no-results">
      <svg viewBox="0 0 24 24" width="48" height="48">
        <path fill="currentColor"
          d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
      <p>{{ query ? `未找到 "${query}" 的结果` : '输入关键词开始搜索' }}</p>
    </div>

    <div v-else class="results-list">
      <SearchResult v-for="(result, index) in results" :key="result.id" :result="result"
        :selected="index === selectedIndex" @click="$emit('select', index)" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface SearchResult {
  id: string
  title: string
  url: string
  excerpt?: string
  score?: number
}

interface Props {
  results: SearchResult[]
  query: string
  selectedIndex: number
}

defineProps<Props>()
defineEmits<{
  (e: 'select', index: number): void
}>()
</script>

<style scoped>
.search-results {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
  max-height: 50vh;
}

.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.search-results::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.dark .search-results::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #999;
}

.no-results svg {
  margin-bottom: 1rem;
  opacity: 0.3;
}

.no-results p {
  font-size: 1rem;
  text-align: center;
}

.results-list {
  padding: 0.5rem 0;
}
</style>
