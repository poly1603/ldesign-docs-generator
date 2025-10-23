<template>
  <div class="home-layout">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-container">
        <h1 class="hero-title">
          <span class="gradient-text">{{ hero.title }}</span>
        </h1>
        <p class="hero-tagline">{{ hero.tagline }}</p>
        <div class="hero-actions">
          <a v-for="action in hero.actions" :key="action.link" :href="action.link" class="hero-action"
            :class="action.theme || 'primary'">
            {{ action.text }}
          </a>
        </div>
      </div>
    </section>

    <!-- Features 区域 -->
    <section class="features" v-if="features.length > 0">
      <div class="features-container">
        <div v-for="(feature, index) in features" :key="index" class="feature-item">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-details">{{ feature.details }}</p>
          <a v-if="feature.link" :href="feature.link" class="feature-link">
            了解更多 →
          </a>
        </div>
      </div>
    </section>

    <!-- 额外内容插槽 -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface HeroAction {
  text: string
  link: string
  theme?: 'primary' | 'secondary' | 'alt'
}

interface Hero {
  title: string
  tagline: string
  actions: HeroAction[]
}

interface Feature {
  icon: string
  title: string
  details: string
  link?: string
}

const hero = ref<Hero>({
  title: 'LDesign Docs Generator',
  tagline: '智能文档生成器 - 集成 VitePress 所有功能 + 自动化文档生成',
  actions: [
    { text: '快速开始', link: '/guide/quick-start', theme: 'primary' },
    { text: '查看示例', link: '/examples/', theme: 'secondary' },
    { text: 'GitHub', link: 'https://github.com/ldesign/ldesign', theme: 'alt' },
  ],
})

const features = ref<Feature[]>([
  {
    icon: '⚡',
    title: 'Vite 驱动',
    details: '极速的开发服务器和热模块替换（HMR），开发体验极佳',
  },
  {
    icon: '🤖',
    title: '自动化文档',
    details: 'TypeScript API 和 Vue/React 组件文档自动生成，告别手写',
  },
  {
    icon: '🎨',
    title: 'Markdown 增强',
    details: '容器、代码组、行高亮、Emoji 等丰富的 Markdown 增强功能',
  },
  {
    icon: '🎮',
    title: '交互式 Playground',
    details: '内置代码编辑器和实时预览，组件演示更直观',
  },
  {
    icon: '🌍',
    title: '国际化支持',
    details: '完整的多语言支持，轻松构建国际化文档站点',
  },
  {
    icon: '🚀',
    title: '性能优化',
    details: '代码分割、图片优化、预加载等全方位性能优化',
  },
])
</script>

<style scoped>
.home-layout {
  min-height: calc(100vh - 60px);
}

/* Hero 区域 */
.hero {
  padding: 4rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.gradient-text {
  background: linear-gradient(120deg, #fff 30%, #42b983);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-tagline {
  font-size: 1.5rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-action {
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  display: inline-block;
}

.hero-action.primary {
  background-color: white;
  color: #667eea;
}

.hero-action.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3);
}

.hero-action.secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.hero-action.secondary:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.hero-action.alt {
  background-color: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.hero-action.alt:hover {
  border-color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Features 区域 */
.features {
  padding: 4rem 2rem;
  background-color: var(--bg-color);
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-item {
  padding: 2rem;
  border-radius: 12px;
  background-color: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  transition: all 0.3s;
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #42b983;
}

.dark .feature-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

.feature-details {
  color: #666;
  line-height: 1.6;
  font-size: 0.9375rem;
  margin-bottom: 1rem;
}

.dark .feature-details {
  color: #999;
}

.feature-link {
  display: inline-block;
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.feature-link:hover {
  color: #33a06f;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-tagline {
    font-size: 1.25rem;
  }

  .features-container {
    grid-template-columns: 1fr;
  }
}
</style>

