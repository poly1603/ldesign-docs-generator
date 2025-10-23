<template>
  <footer class="doc-footer" v-if="hasPrevNext || hasContribute">
    <!-- 上一页/下一页导航 -->
    <nav v-if="hasPrevNext" class="page-nav">
      <div class="prev">
        <a v-if="prev" :href="prev.link" class="nav-link">
          <span class="arrow">←</span>
          <span class="text">
            <span class="label">{{ t('footer.prev') }}</span>
            <span class="title">{{ prev.text }}</span>
          </span>
        </a>
      </div>
      <div class="next">
        <a v-if="next" :href="next.link" class="nav-link">
          <span class="text">
            <span class="label">{{ t('footer.next') }}</span>
            <span class="title">{{ next.text }}</span>
          </span>
          <span class="arrow">→</span>
        </a>
      </div>
    </nav>

    <!-- 编辑链接和贡献信息 -->
    <div v-if="hasContribute" class="contribute-section">
      <div class="contribute-item" v-if="editLink">
        <EditLink :edit-link="editLink" />
      </div>
      <div class="contribute-item" v-if="lastUpdated">
        <LastUpdated :timestamp="lastUpdated" />
      </div>
      <div class="contribute-item" v-if="contributors && contributors.length > 0">
        <Contributors :contributors="contributors" />
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import EditLink from './EditLink.vue'
import LastUpdated from './LastUpdated.vue'
import Contributors from './Contributors.vue'

interface NavItem {
  text: string
  link: string
}

interface Contributor {
  name: string
  avatar?: string
  url?: string
}

// 页面导航数据（从配置或侧边栏生成）
const prev = ref<NavItem | null>({
  text: '快速开始',
  link: '/guide/quick-start',
})

const next = ref<NavItem | null>({
  text: '配置参考',
  link: '/guide/configuration',
})

// 编辑链接配置
const editLink = ref({
  pattern: 'https://github.com/ldesign/ldesign/edit/main/tools/docs-generator/:path',
  text: '在 GitHub 上编辑此页',
})

// 最后更新时间（从 Git 提取）
const lastUpdated = ref<number>(Date.now())

// 贡献者列表（从 Git 提取）
const contributors = ref<Contributor[]>([
  { name: 'User1', avatar: 'https://github.com/user1.png', url: 'https://github.com/user1' },
  { name: 'User2', avatar: 'https://github.com/user2.png', url: 'https://github.com/user2' },
])

const hasPrevNext = computed(() => prev.value || next.value)
const hasContribute = computed(() => editLink.value || lastUpdated.value || contributors.value?.length > 0)

// i18n 翻译函数
function t(key: string): string {
  const translations: Record<string, string> = {
    'footer.prev': '上一页',
    'footer.next': '下一页',
  }
  return translations[key] || key
}
</script>

<style scoped>
.doc-footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.page-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.prev {
  grid-column: 1;
}

.next {
  grid-column: 2;
  text-align: right;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
  color: var(--text-color);
  background-color: var(--bg-color);
}

.nav-link:hover {
  border-color: #42b983;
  background-color: rgba(66, 185, 131, 0.05);
}

.arrow {
  font-size: 1.25rem;
  color: #42b983;
  flex-shrink: 0;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dark .label {
  color: #999;
}

.title {
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.next .nav-link {
  flex-direction: row-reverse;
}

.next .text {
  align-items: flex-end;
}

.contribute-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.dark .contribute-section {
  background-color: rgba(255, 255, 255, 0.02);
}

.contribute-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .page-nav {
    grid-template-columns: 1fr;
  }

  .next {
    text-align: left;
  }

  .next .nav-link {
    flex-direction: row;
  }

  .next .text {
    align-items: flex-start;
  }
}
</style>

