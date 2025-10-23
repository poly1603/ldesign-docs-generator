<template>
  <button
    class="theme-toggle"
    :class="{ 'dark': isDark }"
    @click="toggle"
    :title="isDark ? '切换到浅色模式' : '切换到暗黑模式'"
  >
    <transition name="fade" mode="out-in">
      <svg v-if="!isDark" class="icon sun" viewBox="0 0 24 24" key="sun">
        <circle cx="12" cy="12" r="5" fill="currentColor"/>
        <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <svg v-else class="icon moon" viewBox="0 0 24 24" key="moon">
        <path
          fill="currentColor"
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        />
      </svg>
    </transition>
  </button>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const isDark = inject('isDark')
const toggleTheme = inject('toggleTheme')

function toggle() {
  if (typeof toggleTheme === 'function') {
    toggleTheme()
  }
}
</script>

<style scoped>
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.theme-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.1);
}

.dark .theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.icon {
  width: 20px;
  height: 20px;
  color: #666;
  transition: all 0.3s;
}

.dark .icon {
  color: #fbbf24;
}

.sun {
  animation: rotate 20s linear infinite;
}

.moon {
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-90deg);
}

.fade-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(90deg);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}
</style>


