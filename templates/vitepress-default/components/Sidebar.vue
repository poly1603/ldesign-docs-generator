<template>
  <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-header">
      <input v-model="searchQuery" type="text" placeholder="搜索..." class="sidebar-search" />
    </div>

    <nav class="sidebar-nav">
      <SidebarGroup v-for="(group, index) in filteredSidebarItems" :key="index" :group="group" :depth="0" />
    </nav>

    <button class="sidebar-toggle" @click="toggleSidebar">
      <span v-if="isCollapsed">→</span>
      <span v-else>←</span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SidebarGroup from './SidebarGroup.vue'

interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

// 侧边栏状态
const isCollapsed = ref(false)
const searchQuery = ref('')

// 侧边栏数据（从配置读取）
const sidebarItems = ref<SidebarItem[]>([
  {
    text: '开始',
    items: [
      { text: '介绍', link: '/guide/introduction' },
      { text: '快速开始', link: '/guide/quick-start' },
      { text: '安装', link: '/guide/installation' },
    ],
  },
  {
    text: 'API 参考',
    items: [
      { text: '核心 API', link: '/api/core' },
      { text: '工具函数', link: '/api/utils' },
      { text: '插件 API', link: '/api/plugins' },
    ],
  },
  {
    text: '组件',
    items: [
      { text: 'Button', link: '/components/button' },
      { text: 'Input', link: '/components/input' },
      { text: 'Select', link: '/components/select' },
    ],
  },
])

// 搜索过滤
const filteredSidebarItems = computed(() => {
  if (!searchQuery.value) {
    return sidebarItems.value
  }

  const query = searchQuery.value.toLowerCase()
  return filterItems(sidebarItems.value, query)
})

function filterItems(items: SidebarItem[], query: string): SidebarItem[] {
  return items
    .map((item) => {
      const matchesText = item.text.toLowerCase().includes(query)
      const filteredChildren = item.items ? filterItems(item.items, query) : []

      if (matchesText || filteredChildren.length > 0) {
        return {
          ...item,
          items: filteredChildren.length > 0 ? filteredChildren : item.items,
        }
      }

      return null
    })
    .filter((item): item is SidebarItem => item !== null)
}

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar-collapsed', isCollapsed.value.toString())
}

onMounted(() => {
  // 恢复侧边栏状态
  const savedState = localStorage.getItem('sidebar-collapsed')
  if (savedState) {
    isCollapsed.value = savedState === 'true'
  }
})
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: calc(100vh - 60px);
  position: sticky;
  top: 60px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s, transform 0.3s;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-search {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.sidebar-search:focus {
  outline: none;
  border-color: #42b983;
}

.sidebar.collapsed .sidebar-search {
  display: none;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.dark .sidebar-nav::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}

.sidebar-toggle {
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  transition: all 0.2s;
  z-index: 10;
}

.sidebar-toggle:hover {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    z-index: 999;
    transform: translateX(-100%);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: none;
  }
}
</style>

