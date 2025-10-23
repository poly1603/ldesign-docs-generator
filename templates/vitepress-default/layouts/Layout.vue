<template>
  <div class="vitepress-layout" :class="{ 'dark': isDark }">
    <Navbar />
    
    <div class="layout-content">
      <Sidebar v-if="hasSidebar" />
      
      <main class="main-content">
        <slot />
      </main>
      
      <TOC v-if="hasTOC" />
    </div>
    
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted } from 'vue'
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
import TOC from '../components/TOC.vue'
import Footer from '../components/Footer.vue'

// 主题状态
const isDark = ref(false)

// 布局状态
const hasSidebar = computed(() => true) // TODO: 从配置读取
const hasTOC = computed(() => true) // TODO: 从配置读取

// 提供主题状态给子组件
provide('isDark', isDark)

// 初始化主题
onMounted(() => {
  // 读取本地存储的主题设置
  const savedTheme = localStorage.getItem('vitepress-theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // 检测系统主题
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('vitepress-theme')) {
      isDark.value = e.matches
    }
  })
})

// 切换主题
function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('vitepress-theme', isDark.value ? 'dark' : 'light')
}

// 导出切换函数供其他组件使用
provide('toggleTheme', toggleTheme)
</script>

<style scoped>
.vitepress-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background-color 0.2s, color 0.2s;
}

.vitepress-layout:not(.dark) {
  --bg-color: #ffffff;
  --text-color: #213547;
  --border-color: #e2e8f0;
  --sidebar-bg: #f6f8fa;
}

.vitepress-layout.dark {
  --bg-color: #1a1a1a;
  --text-color: #e4e4e7;
  --border-color: #2e2e32;
  --sidebar-bg: #161618;
}

.layout-content {
  flex: 1;
  display: flex;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.main-content {
  flex: 1;
  min-width: 0;
  padding: 2rem;
}

@media (max-width: 768px) {
  .layout-content {
    flex-direction: column;
  }
}
</style>


