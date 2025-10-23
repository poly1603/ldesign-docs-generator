<template>
  <div class="sidebar-group" :class="{ 'collapsed': isCollapsed }">
    <div
      v-if="group.text"
      class="sidebar-group-title"
      :style="{ paddingLeft: `${depth * 1}rem` }"
      @click="toggleCollapse"
    >
      <span class="collapse-icon" v-if="group.items && group.items.length > 0">
        {{ isCollapsed ? '▸' : '▾' }}
      </span>
      <span class="title-text">{{ group.text }}</span>
    </div>

    <div v-if="!isCollapsed" class="sidebar-group-items">
      <template v-for="(item, index) in group.items" :key="index">
        <SidebarGroup
          v-if="item.items"
          :group="item"
          :depth="depth + 1"
        />
        <a
          v-else
          :href="item.link"
          class="sidebar-item"
          :class="{ 'active': isActive(item.link) }"
          :style="{ paddingLeft: `${(depth + 1) * 1 + 0.5}rem` }"
        >
          {{ item.text }}
        </a>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

interface Props {
  group: SidebarItem
  depth: number
}

const props = defineProps<Props>()

const isCollapsed = ref(props.group.collapsed || false)

function toggleCollapse() {
  if (props.group.items && props.group.items.length > 0) {
    isCollapsed.value = !isCollapsed.value
  }
}

function isActive(link?: string): boolean {
  if (!link) return false
  return window.location.pathname === link
}

onMounted(() => {
  // 如果包含当前活动项，展开该组
  if (props.group.items) {
    const hasActiveChild = props.group.items.some((item) => isActive(item.link))
    if (hasActiveChild) {
      isCollapsed.value = false
    }
  }
})
</script>

<style scoped>
.sidebar-group {
  margin-bottom: 0.5rem;
}

.sidebar-group-title {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  border-radius: 4px;
  margin: 0 0.5rem;
}

.sidebar-group-title:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .sidebar-group-title:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.collapse-icon {
  margin-right: 0.5rem;
  font-size: 0.75rem;
  color: #666;
  transition: transform 0.2s;
}

.dark .collapse-icon {
  color: #999;
}

.title-text {
  flex: 1;
}

.sidebar-group-items {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sidebar-item {
  display: block;
  padding: 0.5rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s;
  border-radius: 4px;
  margin: 0.25rem 0.5rem;
  border-left: 2px solid transparent;
}

.sidebar-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-left-color: #42b983;
}

.dark .sidebar-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.sidebar-item.active {
  color: #42b983;
  font-weight: 600;
  background-color: rgba(66, 185, 131, 0.1);
  border-left-color: #42b983;
}
</style>


