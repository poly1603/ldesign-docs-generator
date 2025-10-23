/**
 * Giscus 评论系统集成
 * 基于 GitHub Discussions 的评论系统
 */

import type { Logger } from '../../types'

/**
 * Giscus 配置
 */
export interface GiscusConfig {
  /** 是否启用 */
  enabled?: boolean
  /** GitHub 仓库 (格式: owner/repo) */
  repo: string
  /** 仓库 ID */
  repoId: string
  /** Discussion 分类 */
  category: string
  /** 分类 ID */
  categoryId: string
  /** 映射方式 */
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number'
  /** 反应启用 */
  reactionsEnabled?: boolean
  /** 输入位置 */
  inputPosition?: 'top' | 'bottom'
  /** 主题 */
  theme?: 'light' | 'dark' | 'preferred_color_scheme' | string
  /** 语言 */
  lang?: string
  /** 懒加载 */
  lazy?: boolean
}

/**
 * Giscus 集成
 */
export class GiscusIntegration {
  private config: GiscusConfig
  private logger: Logger

  constructor(config: GiscusConfig, logger: Logger) {
    this.config = {
      mapping: 'pathname',
      reactionsEnabled: true,
      inputPosition: 'bottom',
      theme: 'preferred_color_scheme',
      lang: 'zh-CN',
      lazy: true,
      ...config,
    }
    this.logger = logger
  }

  /**
   * 生成 Giscus 脚本标签
   */
  generateScript(): string {
    if (!this.config.enabled) {
      return ''
    }

    const attrs = [
      `src="https://giscus.app/client.js"`,
      `data-repo="${this.config.repo}"`,
      `data-repo-id="${this.config.repoId}"`,
      `data-category="${this.config.category}"`,
      `data-category-id="${this.config.categoryId}"`,
      `data-mapping="${this.config.mapping}"`,
      `data-reactions-enabled="${this.config.reactionsEnabled ? '1' : '0'}"`,
      `data-input-position="${this.config.inputPosition}"`,
      `data-theme="${this.config.theme}"`,
      `data-lang="${this.config.lang}"`,
      `crossorigin="anonymous"`,
      `async`,
    ]

    if (this.config.lazy) {
      attrs.push('data-loading="lazy"')
    }

    return `<script ${attrs.join(' ')}></script>`
  }

  /**
   * 生成 Vue 组件
   */
  generateVueComponent(): string {
    return `
<template>
  <div class="giscus-container" ref="containerRef"></div>
</template>

<script setup>
import { ref, onMounted, inject, watch } from 'vue'

const containerRef = ref(null)
const isDark = inject('isDark', ref(false))

const config = ${JSON.stringify(this.config, null, 2)}

function loadGiscus() {
  if (!containerRef.value) return

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', config.repo)
  script.setAttribute('data-repo-id', config.repoId)
  script.setAttribute('data-category', config.category)
  script.setAttribute('data-category-id', config.categoryId)
  script.setAttribute('data-mapping', config.mapping)
  script.setAttribute('data-reactions-enabled', config.reactionsEnabled ? '1' : '0')
  script.setAttribute('data-input-position', config.inputPosition)
  script.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  script.setAttribute('data-lang', config.lang)
  script.setAttribute('crossorigin', 'anonymous')
  script.async = true

  if (config.lazy) {
    script.setAttribute('data-loading', 'lazy')
  }

  containerRef.value.appendChild(script)
}

// 监听主题变化，更新 Giscus 主题
watch(isDark, (newValue) => {
  const iframe = document.querySelector('iframe.giscus-frame')
  if (iframe) {
    iframe.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: newValue ? 'dark' : 'light' } } },
      'https://giscus.app'
    )
  }
})

onMounted(() => {
  loadGiscus()
})
</script>

<style scoped>
.giscus-container {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}
</style>
`
  }
}

/**
 * 创建 Giscus 集成
 */
export function createGiscusIntegration(config: GiscusConfig, logger: Logger): GiscusIntegration {
  return new GiscusIntegration(config, logger)
}


