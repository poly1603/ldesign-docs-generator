<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="search-modal-overlay" @click="close">
        <div class="search-modal" @click.stop>
          <SearchInput v-model="query" :loading="isSearching" @search="handleSearch" @close="close" />

          <SearchResults :results="results" :query="query" :selected-index="selectedIndex" @select="handleSelect" />

          <div class="search-footer">
            <div class="search-commands">
              <kbd>↑↓</kbd> 导航
              <kbd>↵</kbd> 选择
              <kbd>Esc</kbd> 关闭
            </div>
            <div class="search-powered">
              Powered by <strong>MiniSearch</strong>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import SearchInput from './SearchInput.vue'
import SearchResults from './SearchResults.vue'
import { useSearch } from '../../composables/useSearch'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const isOpen = ref(props.modelValue)
const query = ref('')
const selectedIndex = ref(0)

const { search, results, isSearching } = useSearch()

watch(() => props.modelValue, (val) => {
  isOpen.value = val
  if (val) {
    // 打开时聚焦输入框
    setTimeout(() => {
      const input = document.querySelector('.search-input') as HTMLInputElement
      input?.focus()
    }, 100)
  }
})

function close() {
  isOpen.value = false
  emit('update:modelValue', false)
  query.value = ''
  selectedIndex.value = 0
}

async function handleSearch(q: string) {
  await search(q)
  selectedIndex.value = 0
}

function handleSelect(index: number) {
  const result = results.value[index]
  if (result) {
    window.location.href = result.url
    close()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return

  switch (e.key) {
    case 'Escape':
      e.preventDefault()
      close()
      break
    case 'ArrowDown':
      e.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      e.preventDefault()
      handleSelect(selectedIndex.value)
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

.search-modal {
  width: 90%;
  max-width: 640px;
  max-height: 80vh;
  background: var(--bg-color);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #666;
  background: var(--sidebar-bg);
}

.dark .search-footer {
  color: #999;
}

.search-commands {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-commands kbd {
  padding: 0.125rem 0.375rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.6875rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.search-powered {
  font-size: 0.6875rem;
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-active .search-modal,
.modal-leave-active .search-modal {
  transition: transform 0.3s, opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .search-modal {
  transform: scale(0.95) translateY(-20px);
  opacity: 0;
}

.modal-leave-to .search-modal {
  transform: scale(0.95);
  opacity: 0;
}
</style>
