/**
 * Markdown Vite 插件
 * 将 Markdown 文件转换为 Vue 组件，集成所有增强功能
 */

import { Plugin } from 'vite'
import * as fs from 'fs-extra'
import * as path from 'path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import type { Logger, MarkdownConfig } from '../../types'
import { applyMarkdownEnhancements, getMarkdownStyles, getMarkdownScripts } from '../../markdown'
import { createShikiHighlighter, shikiStyles } from '../../markdown/plugins/shiki-highlighter'
import { createShikiTransformer, transformerStyles } from '../../markdown/plugins/shiki-transformer'

/**
 * Markdown 插件选项
 */
export interface MarkdownPluginOptions {
  /** 源目录 */
  sourceDir: string
  /** 日志器 */
  logger: Logger
  /** Markdown 配置 */
  markdown?: MarkdownConfig
}

/**
 * 创建 Markdown 插件
 */
export function createMarkdownPlugin(options: MarkdownPluginOptions): Plugin {
  const { sourceDir, logger, markdown: markdownConfig = {} } = options

  // 初始化 Markdown-it
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    ...markdownConfig.markdownItOptions,
  })

  // 初始化 Shiki（如果启用）
  let shikiHighlighter: any = null
  let shikiTransformer: any = null

  if (markdownConfig.theme) {
    shikiHighlighter = createShikiHighlighter({
      themes: ['dark-plus', 'light-plus', 'nord', 'monokai'],
      defaultLightTheme: 'light-plus',
      defaultDarkTheme: markdownConfig.theme || 'dark-plus',
    }, logger)

    shikiTransformer = createShikiTransformer({
      enableDiff: true,
      enableFocus: true,
      enableDiagnostics: true,
    })

    // 替换 fence 渲染规则使用 Shiki
    const fence = md.renderer.rules.fence!
    md.renderer.rules.fence = async (tokens, idx, options, env, slf) => {
      const token = tokens[idx]
      const code = token.content
      const lang = token.info.trim().split(/\s+/)[0]

      if (shikiHighlighter && lang) {
        try {
          // 使用 Shiki 高亮
          const highlighted = await shikiHighlighter.highlightDualTheme(code, lang, {
            lineNumbers: markdownConfig.lineNumbers,
          })

          return `
<div class="shiki-container">
  <div class="shiki light">${highlighted.light}</div>
  <div class="shiki dark">${highlighted.dark}</div>
</div>`
        } catch (error) {
          logger.warn(`Shiki 高亮失败，使用默认: ${lang}`)
          return fence(tokens, idx, options, env, slf)
        }
      }

      return fence(tokens, idx, options, env, slf)
    }
  }

  // 应用所有 Markdown 增强功能
  applyMarkdownEnhancements(md, markdownConfig, sourceDir)

  return {
    name: 'ldesign-docs:markdown',

    // 处理 .md 文件
    async transform(code, id) {
      if (!id.endsWith('.md')) {
        return null
      }

      try {
        // 解析 frontmatter
        const { data: frontmatter, content: markdown } = matter(code)

        // 渲染 HTML
        const html = md.render(markdown)

        // 生成 Vue 组件
        const component = generateVueComponent(html, frontmatter, id, sourceDir)

        return {
          code: component,
          map: null,
        }
      } catch (error) {
        logger.error(`解析 Markdown 文件失败: ${id}`, error)
        throw error
      }
    },

    // 热更新
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.md')) {
        logger.debug(`Markdown 文件已更新: ${file}`)

        // 触发完整重载
        server.ws.send({
          type: 'full-reload',
          path: '*',
        })
      }
    },
  }
}

/**
 * 生成 Vue 组件
 */
function generateVueComponent(html: string, frontmatter: any, filepath: string, sourceDir: string): string {
  const frontmatterJson = JSON.stringify(frontmatter)
  const escapedHtml = html.replace(/`/g, '\\`').replace(/\$/g, '\\$')

  // 获取样式和脚本
  const styles = getMarkdownStyles()
  const scripts = getMarkdownScripts()

  return `
<template>
  <div class="markdown-content" v-html="content"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const frontmatter = ${frontmatterJson}
const content = \`${escapedHtml}\`

// 元数据
defineOptions({
  name: 'MarkdownPage',
  frontmatter,
})

// 代码复制功能
onMounted(() => {
  // 为所有代码块添加复制按钮
  const codeBlocks = document.querySelectorAll('pre code')
  codeBlocks.forEach(block => {
    const button = document.createElement('button')
    button.className = 'copy-code-button'
    button.textContent = '复制'
    button.onclick = () => {
      navigator.clipboard.writeText(block.textContent || '')
      button.textContent = '已复制！'
      setTimeout(() => {
        button.textContent = '复制'
      }, 2000)
    }
    block.parentElement?.appendChild(button)
  })

  // 执行 Markdown 脚本
  ${scripts}
})
</script>

<style>
/* 注入所有 Markdown 增强样式 */
${styles}

/* Shiki 样式 */
${shikiStyles}

/* 转换器样式 */
${transformerStyles}

.markdown-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.markdown-content :deep(h1) { font-size: 2.25em; }
.markdown-content :deep(h2) { font-size: 1.75em; }
.markdown-content :deep(h3) { font-size: 1.5em; }

.markdown-content :deep(p) {
  margin: 1em 0;
  line-height: 1.7;
}

.markdown-content :deep(pre) {
  position: relative;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1.25rem 1.5rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-content :deep(code) {
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
  font-size: 0.875em;
}

.markdown-content :deep(:not(pre) > code) {
  background: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  color: #476582;
}

.markdown-content :deep(.copy-code-button) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.markdown-content :deep(.copy-code-button:hover) {
  background: rgba(255, 255, 255, 0.2);
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #42b983;
  padding-left: 1em;
  margin: 1em 0;
  color: #666;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #ddd;
  padding: 0.75em;
  text-align: left;
}

.markdown-content :deep(th) {
  background: #f4f4f4;
  font-weight: 600;
}

.markdown-content :deep(a) {
  color: #42b983;
  text-decoration: none;
  transition: color 0.2s;
}

.markdown-content :deep(a:hover) {
  color: #33a06f;
  text-decoration: underline;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1em 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 2em;
  margin: 1em 0;
}

.markdown-content :deep(li) {
  margin: 0.5em 0;
  line-height: 1.7;
}
</style>
`
}

