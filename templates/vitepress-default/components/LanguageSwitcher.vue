<template>
  <div class="language-switcher" ref="switcherRef">
    <button
      class="language-button"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      aria-haspopup="true"
    >
      <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
        <path
          fill="currentColor"
          d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
        />
      </svg>
      <span class="current-lang">{{ currentLocale.label }}</span>
      <svg class="arrow" :class="{ 'open': isOpen }" viewBox="0 0 24 24" width="16" height="16">
        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
      </svg>
    </button>

    <transition name="dropdown">
      <ul v-if="isOpen" class="language-dropdown" role="menu">
        <li
          v-for="locale in availableLocales"
          :key="locale.lang"
          role="menuitem"
        >
          <a
            :href="getSwitchPath(locale.lang)"
            class="language-option"
            :class="{ 'active': locale.lang === currentLocale.lang }"
            @click="switchLanguage(locale.lang, $event)"
          >
            <span class="locale-name">{{ locale.selectText || locale.label }}</span>
            <svg v-if="locale.lang === currentLocale.lang" class="check-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </a>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Locale {
  lang: string
  label: string
  selectText?: string
}

const switcherRef = ref<HTMLElement>()
const isOpen = ref(false)

// 当前语言
const currentLang = ref('zh-CN')

// 可用语言列表
const availableLocales = ref<Locale[]>([
  { lang: 'zh-CN', label: '简体中文', selectText: '简体中文' },
  { lang: 'en-US', label: 'English', selectText: 'English' },
])

const currentLocale = computed(() => {
  return availableLocales.value.find(l => l.lang === currentLang.value) || availableLocales.value[0]
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function getSwitchPath(lang: string): string {
  // 获取当前路径
  const currentPath = window.location.pathname
  
  // 移除当前语言前缀
  let pathWithoutLocale = currentPath
  for (const locale of availableLocales.value) {
    if (currentPath.startsWith(`/${locale.lang}/`)) {
      pathWithoutLocale = currentPath.substring(locale.lang.length + 1)
      break
    }
  }

  // 添加新的语言前缀
  if (lang === 'zh-CN') {
    // 默认语言不需要前缀
    return pathWithoutLocale || '/'
  } else {
    return `/${lang}${pathWithoutLocale}`
  }
}

function switchLanguage(lang: string, event: Event) {
  event.preventDefault()
  const targetPath = getSwitchPath(lang)
  
  currentLang.value = lang
  isOpen.value = false

  // 保存语言选择
  localStorage.setItem('preferred-locale', lang)
  
  // 跳转到新的语言页面
  window.location.href = targetPath
}

function handleClickOutside(event: MouseEvent) {
  if (switcherRef.value && !switcherRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  // 读取保存的语言偏好
  const savedLocale = localStorage.getItem('preferred-locale')
  if (savedLocale && availableLocales.value.some(l => l.lang === savedLocale)) {
    currentLang.value = savedLocale
  }

  // 监听外部点击
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.language-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-color);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.language-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .language-button:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.icon {
  color: #666;
}

.dark .icon {
  color: #999;
}

.current-lang {
  min-width: 60px;
  text-align: left;
}

.arrow {
  color: #999;
  transition: transform 0.2s;
}

.arrow.open {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 160px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  list-style: none;
  margin: 0;
  z-index: 1000;
}

.dark .language-dropdown {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.language-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s;
  cursor: pointer;
}

.language-option:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .language-option:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.language-option.active {
  color: #42b983;
  font-weight: 600;
}

.check-icon {
  color: #42b983;
  flex-shrink: 0;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 768px) {
  .language-dropdown {
    right: -1rem;
  }
}
</style>


