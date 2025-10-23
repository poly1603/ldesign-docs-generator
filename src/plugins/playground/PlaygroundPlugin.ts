/**
 * Playground 插件
 * 
 * 提供交互式代码示例和实时预览
 */

import type { DocsPlugin, DocNode, GenerateContext } from '../../types'
import fs from 'fs-extra'
import * as path from 'path'

/**
 * Playground 插件选项
 */
export interface PlaygroundPluginOptions {
  /** 支持的框架 */
  frameworks?: ('vue' | 'react')[]
  /** 编辑器主题 */
  editorTheme?: 'vs-dark' | 'vs-light'
  /** 是否启用沙箱隔离 */
  sandbox?: boolean
  /** CDN 地址 */
  cdn?: {
    vue?: string
    react?: string
    reactDom?: string
  }
}

/**
 * Playground 插件
 */
export function playgroundPlugin(options: PlaygroundPluginOptions = {}): DocsPlugin {
  const {
    frameworks = ['vue', 'react'],
    editorTheme = 'vs-light',
    sandbox = true,
    cdn = {
      vue: 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js',
      react: 'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js',
      reactDom: 'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js',
    },
  } = options

  return {
    name: 'playground',
    version: '1.0.0',
    description: 'Interactive playground for components',

    /**
     * 转换文档，添加 playground 元数据
     */
    async transform(docs: DocNode[], context): Promise<DocNode[]> {
      const { logger } = context

      logger.debug('处理 Playground 示例...')

      for (const doc of docs) {
        if (doc.type === 'component' && doc.content.examples) {
          // 标记组件支持 Playground
          doc.metadata.hasPlayground = true
          doc.metadata.framework = doc.content.framework

          // 为每个示例添加 playground 标记
          doc.content.examples.forEach((example: any) => {
            example.playgroundEnabled = true
            example.playgroundId = `playground-${generateId()}`
          })
        }
      }

      return docs
    },

    /**
     * 生成 Playground 资源
     */
    async afterGenerate(context: GenerateContext): Promise<void> {
      const { docs, outputDir, logger } = context

      // 检查是否有组件需要 Playground
      const playgroundDocs = docs.filter(doc => doc.metadata.hasPlayground)

      if (playgroundDocs.length === 0) {
        return
      }

      logger.info(`生成 ${playgroundDocs.length} 个 Playground`)

      // 复制 Playground 资源
      await copyPlaygroundAssets(outputDir)

      // 生成配置文件
      await generatePlaygroundConfig(outputDir, {
        frameworks,
        editorTheme,
        sandbox,
        cdn,
      })

      logger.success('Playground 资源已生成')
    },
  }
}

/**
 * 复制 Playground 资源
 */
async function copyPlaygroundAssets(outputDir: string): Promise<void> {
  const assetsDir = path.join(outputDir, 'assets', 'playground')
  await fs.ensureDir(assetsDir)

  // 生成 Playground 客户端脚本
  const playgroundScript = generatePlaygroundScript()
  await fs.writeFile(
    path.join(assetsDir, 'playground.js'),
    playgroundScript,
    'utf-8'
  )

  // 生成 Playground 样式
  const playgroundStyles = generatePlaygroundStyles()
  await fs.writeFile(
    path.join(assetsDir, 'playground.css'),
    playgroundStyles,
    'utf-8'
  )
}

/**
 * 生成 Playground 配置
 */
async function generatePlaygroundConfig(
  outputDir: string,
  config: any
): Promise<void> {
  const configPath = path.join(outputDir, 'playground-config.json')
  await fs.writeJSON(configPath, config, { spaces: 2 })
}

/**
 * 生成 Playground 脚本
 */
function generatePlaygroundScript(): string {
  return `/**
 * Playground 客户端运行时
 */

class Playground {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId)
    this.options = options
    this.editor = null
    this.preview = null
    this.init()
  }
  
  init() {
    if (!this.container) {
      console.error('Playground container not found')
      return
    }
    
    this.createLayout()
    this.initEditor()
    this.initPreview()
  }
  
  createLayout() {
    this.container.innerHTML = \`
      <div class="playground-layout">
        <div class="playground-editor" id="\${this.container.id}-editor"></div>
        <div class="playground-preview" id="\${this.container.id}-preview"></div>
      </div>
    \`
  }
  
  initEditor() {
    const editorEl = this.container.querySelector('.playground-editor')
    
    // 使用简单的 textarea（实际应该集成 Monaco Editor 或 CodeMirror）
    editorEl.innerHTML = \`
      <textarea class="code-editor" id="\${this.container.id}-code"></textarea>
      <button class="run-button">运行</button>
    \`
    
    const textarea = editorEl.querySelector('.code-editor')
    const button = editorEl.querySelector('.run-button')
    
    textarea.value = this.options.code || ''
    
    button.addEventListener('click', () => {
      this.run(textarea.value)
    })
  }
  
  initPreview() {
    this.preview = this.container.querySelector('.playground-preview')
  }
  
  run(code) {
    if (!this.preview) return
    
    const framework = this.options.framework
    
    if (framework === 'vue') {
      this.runVue(code)
    } else if (framework === 'react') {
      this.runReact(code)
    }
  }
  
  runVue(code) {
    // 创建沙箱 iframe
    const iframe = document.createElement('iframe')
    iframe.className = 'preview-iframe'
    iframe.sandbox = 'allow-scripts'
    
    this.preview.innerHTML = ''
    this.preview.appendChild(iframe)
    
    const doc = iframe.contentDocument
    doc.open()
    doc.write(\`
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js"></script>
      </head>
      <body>
        <div id="app"></div>
        <script>
          const { createApp } = Vue
          try {
            \${code}
          } catch (error) {
            document.body.innerHTML = '<pre style="color: red;">' + error.message + '</pre>'
          }
        </script>
      </body>
      </html>
    \`)
    doc.close()
  }
  
  runReact(code) {
    // 类似的 React 实现
    const iframe = document.createElement('iframe')
    iframe.className = 'preview-iframe'
    iframe.sandbox = 'allow-scripts'
    
    this.preview.innerHTML = ''
    this.preview.appendChild(iframe)
    
    const doc = iframe.contentDocument
    doc.open()
    doc.write(\`
      <!DOCTYPE html>
      <html>
      <head>
        <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          try {
            \${code}
          } catch (error) {
            document.body.innerHTML = '<pre style="color: red;">' + error.message + '</pre>'
          }
        </script>
      </body>
      </html>
    \`)
    doc.close()
  }
}

// 自动初始化所有 playground
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-playground]').forEach(el => {
    new Playground(el.id, {
      code: el.getAttribute('data-code'),
      framework: el.getAttribute('data-framework'),
    })
  })
})
`
}

/**
 * 生成 Playground 样式
 */
function generatePlaygroundStyles(): string {
  return `/**
 * Playground 样式
 */

.playground-layout {
  display: flex;
  gap: 16px;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  overflow: hidden;
  min-height: 400px;
}

.playground-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--code-bg, #f7fafc);
}

.code-editor {
  flex: 1;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
  border: none;
  resize: none;
  background-color: transparent;
  color: var(--text-color, #1a202c);
}

.run-button {
  padding: 8px 16px;
  background-color: var(--primary-color, #3498db);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.run-button:hover {
  background-color: var(--primary-hover, #2980b9);
}

.playground-preview {
  flex: 1;
  background-color: white;
  padding: 16px;
  overflow: auto;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* 响应式 */
@media (max-width: 768px) {
  .playground-layout {
    flex-direction: column;
  }
  
  .playground-editor,
  .playground-preview {
    min-height: 300px;
  }
}
`
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}



