<template>
  <teleport to="body">
    <transition name="menu">
      <div v-if="isOpen" class="mobile-menu-overlay" @click="close">
        <div class="mobile-menu" @click.stop>
          <div class="menu-header">
            <span class="menu-title">菜单</span>
            <button class="close-btn" @click="close">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor"
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          <div class="menu-content">
            <!-- 导航链接 -->
            <nav class="menu-nav">
              <a v-for="item in navItems" :key="item.link" :href="item.link" class="menu-nav-item" @click="close">
                {{ item.text }}
              </a>
            </nav>

            <!-- 侧边栏 -->
            <div class="menu-sidebar">
              <SidebarGroup v-for="(group, index) in sidebarItems" :key="index" :group="group" :depth="0" />
            </div>

            <!-- 工具 -->
            <div class="menu-tools">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SidebarGroup from './SidebarGroup.vue'
import ThemeToggle from './ThemeToggle.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const navItems = ref([
  { text: '首页', link: '/' },
  { text: '指南', link: '/guide/' },
  { text: 'API', link: '/api/' },
  { text: '组件', link: '/components/' },
])

const sidebarItems = ref([
  {
    text: '开始',
    items: [
      { text: '介绍', link: '/guide/introduction' },
      { text: '快速开始', link: '/guide/quick-start' },
    ],
  },
])

function close() {
  emit('update:isOpen', false)
}

// 监听路由变化，自动关闭菜单
watch(() => window.location.pathname, () => {
  close()
})
</script>

<style scoped>
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 85%;
  max-width: 320px;
  background-color: var(--bg-color);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--sidebar-bg);
}

.menu-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .close-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.menu-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.menu-nav-item {
  display: block;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s;
}

.menu-nav-item:hover {
  background-color: rgba(66, 185, 131, 0.1);
  color: #42b983;
}

.menu-sidebar {
  margin-bottom: 2rem;
}

.menu-tools {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 1rem;
  border-top: 1px solid var(--border-color);
}

/* 动画 */
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.3s;
}

.menu-enter-active .mobile-menu,
.menu-leave-active .mobile-menu {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}

.menu-enter-from .mobile-menu {
  transform: translateX(-100%);
}

.menu-leave-to .mobile-menu {
  transform: translateX(-100%);
}
</style>

