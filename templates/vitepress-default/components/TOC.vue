<template>
  <aside class="toc" v-if="tocItems.length > 0">
    <div class="toc-title">目录</div>
    <nav class="toc-nav">
      <a
        v-for="item in tocItems"
        :key="item.slug"
        :href="`#${item.slug}`"
        class="toc-item"
        :class="{
          'active': activeId === item.slug,
          [`level-${item.level}`]: true
        }"
        @click="scrollToHeading(item.slug, $event)"
      >
        {{ item.title }}
      </a>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface TOCItem {
  level: number
  title: string
  slug: string
}

const tocItems = ref<TOCItem[]>([])
const activeId = ref<string>('')

let observer: IntersectionObserver | null = null

function extractTOC() {
  const headings = document.querySelectorAll('.markdown-content h2, .markdown-content h3, .markdown-content h4')
  
  tocItems.value = Array.from(headings).map((heading) => {
    const level = parseInt(heading.tagName.substring(1))
    const title = heading.textContent || ''
    const slug = heading.id || slugify(title)
    
    // 如果没有 id，设置一个
    if (!heading.id) {
      heading.id = slug
    }
    
    return { level, title, slug }
  })
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function scrollToHeading(slug: string, event: Event) {
  event.preventDefault()
  const element = document.getElementById(slug)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.pushState(null, '', `#${slug}`)
  }
}

function setupIntersectionObserver() {
  const headings = document.querySelectorAll('.markdown-content h2, .markdown-content h3, .markdown-content h4')
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      })
    },
    {
      rootMargin: '-80px 0px -80% 0px',
    }
  )

  headings.forEach((heading) => {
    if (observer) {
      observer.observe(heading)
    }
  })
}

onMounted(() => {
  // 延迟提取 TOC，等待内容渲染
  setTimeout(() => {
    extractTOC()
    setupIntersectionObserver()
  }, 100)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.toc {
  width: 240px;
  height: calc(100vh - 60px);
  position: sticky;
  top: 60px;
  padding: 2rem 1rem;
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
}

.toc-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-color);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toc-item {
  display: block;
  color: #666;
  text-decoration: none;
  font-size: 0.8125rem;
  line-height: 1.5;
  transition: all 0.2s;
  border-left: 2px solid transparent;
  padding-left: 0.75rem;
}

.dark .toc-item {
  color: #999;
}

.toc-item:hover {
  color: #42b983;
  border-left-color: rgba(66, 185, 131, 0.3);
}

.toc-item.active {
  color: #42b983;
  font-weight: 600;
  border-left-color: #42b983;
}

.toc-item.level-2 {
  padding-left: 0.75rem;
}

.toc-item.level-3 {
  padding-left: 1.5rem;
  font-size: 0.75rem;
}

.toc-item.level-4 {
  padding-left: 2.25rem;
  font-size: 0.75rem;
}

.toc::-webkit-scrollbar {
  width: 4px;
}

.toc::-webkit-scrollbar-track {
  background: transparent;
}

.toc::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.dark .toc::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}

@media (max-width: 1200px) {
  .toc {
    display: none;
  }
}
</style>


