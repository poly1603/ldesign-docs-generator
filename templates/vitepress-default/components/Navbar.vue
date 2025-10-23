<template>
  <header class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <img v-if="logo" :src="logo" :alt="title" class="logo" />
        <span class="title">{{ title }}</span>
      </div>

      <nav class="navbar-nav">
        <a
          v-for="item in navItems"
          :key="item.link"
          :href="item.link"
          class="nav-item"
        >
          {{ item.text }}
        </a>
      </nav>

      <div class="navbar-actions">
        <button class="theme-toggle" @click="toggleTheme" title="切换主题">
          <span v-if="!isDark">🌙</span>
          <span v-else>☀️</span>
        </button>
        
        <a
          v-if="socialLinks.github"
          :href="socialLinks.github"
          class="social-link"
          target="_blank"
          rel="noopener"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
          </svg>
        </a>
      </div>

      <button class="mobile-menu-toggle" @click="toggleMobileMenu">
        <span class="hamburger"></span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'

// 注入主题状态
const isDark = inject('isDark', ref(false))
const toggleTheme = inject('toggleTheme', () => {})

// Props (从配置读取)
const title = ref('文档站点')
const logo = ref('')
const navItems = ref([
  { text: '首页', link: '/' },
  { text: 'API', link: '/api/' },
  { text: '组件', link: '/components/' },
])
const socialLinks = ref({
  github: 'https://github.com',
})

// 移动端菜单
const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  height: 60px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
}

.navbar-container {
  max-width: 1600px;
  height: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.logo {
  height: 32px;
  width: auto;
}

.navbar-nav {
  display: flex;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.nav-item {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-item:hover {
  color: #42b983;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  border-radius: 8px;
  transition: all 0.2s;
  text-decoration: none;
}

.social-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #42b983;
}

.dark .social-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.mobile-menu-toggle {
  display: none;
}

@media (max-width: 768px) {
  .navbar-nav {
    display: none;
  }

  .mobile-menu-toggle {
    display: block;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    cursor: pointer;
  }

  .hamburger {
    display: block;
    width: 20px;
    height: 2px;
    background-color: var(--text-color);
    position: relative;
  }

  .hamburger::before,
  .hamburger::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    background-color: var(--text-color);
    left: 0;
  }

  .hamburger::before {
    top: -6px;
  }

  .hamburger::after {
    bottom: -6px;
  }
}
</style>


