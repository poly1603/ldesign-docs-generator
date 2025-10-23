/**
 * StackBlitz SDK 集成插件
 * 
 * 使用 StackBlitz SDK 嵌入编辑器
 */

import type { DocsPlugin, DocNode } from '../../types'
import sdk from '@stackblitz/sdk'

/**
 * StackBlitz SDK 插件选项
 */
export interface StackBlitzSDKPluginOptions {
  /** 嵌入方式 */
  embedMode?: 'default' | 'editor' | 'preview'
  /** 打开的文件 */
  openFile?: string
  /** 视图模式 */
  view?: 'default' | 'editor' | 'preview'
}

/**
 * StackBlitz SDK 插件
 */
export function stackblitzSDKPlugin(options: StackBlitzSDKPluginOptions = {}): DocsPlugin {
  const { embedMode = 'default', view = 'default' } = options

  return {
    name: 'stackblitz-sdk',
    version: '1.0.0',
    description: 'StackBlitz SDK 集成',

    /**
     * 转换文档，添加 StackBlitz 嵌入配置
     */
    async transform(docs: DocNode[], context): Promise<DocNode[]> {
      const { logger } = context

      logger.debug('添加 StackBlitz SDK 配置...')

      for (const doc of docs) {
        if (doc.type === 'component' && doc.content.examples) {
          for (const example of doc.content.examples) {
            const project = generateStackBlitzProject(
              example.code,
              doc.content.framework,
              doc.name
            )

            example.stackblitzSDK = {
              project,
              embedMode,
              view,
              openFile: options.openFile || getMainFile(doc.content.framework),
            }
          }

          doc.metadata.hasStackBlitzSDK = true
        }
      }

      return docs
    },

    /**
     * 生成 StackBlitz SDK 脚本
     */
    async afterGenerate(context): Promise<void> {
      const { docs, logger } = context

      const hasStackBlitz = docs.some(doc => doc.metadata.hasStackBlitzSDK)

      if (hasStackBlitz) {
        logger.info('文档包含 StackBlitz SDK，需引入 SDK 脚本')
        // 在模板中添加:
        // <script src="https://unpkg.com/@stackblitz/sdk@1/bundles/sdk.umd.js"></script>
      }
    },
  }
}

/**
 * 生成 StackBlitz 项目
 */
function generateStackBlitzProject(
  code: string,
  framework: string,
  componentName: string
): any {
  if (framework === 'vue') {
    return {
      title: `${componentName} - Vue Example`,
      description: `Example of ${componentName}`,
      template: 'vue',
      files: {
        'src/App.vue': code,
        'src/main.js': `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
      },
    }
  } else if (framework === 'react') {
    return {
      title: `${componentName} - React Example`,
      description: `Example of ${componentName}`,
      template: 'create-react-app',
      files: {
        'src/App.js': code,
        'src/index.js': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)`,
      },
    }
  }

  return {
    title: `${componentName} Example`,
    template: 'javascript',
    files: {
      'index.js': code,
    },
  }
}

/**
 * 获取主文件路径
 */
function getMainFile(framework: string): string {
  if (framework === 'vue') {
    return 'src/App.vue'
  } else if (framework === 'react') {
    return 'src/App.js'
  }
  return 'index.js'
}

/**
 * 生成 StackBlitz 嵌入按钮 HTML
 */
export function generateStackBlitzButtonHTML(
  projectId: string,
  elementId: string
): string {
  return `
    <button
      class="stackblitz-button"
      onclick="stackblitzSDK.embedProjectId('${elementId}', '${projectId}', { 
        view: 'default',
        height: 500,
        openFile: 'src/App.vue'
      })"
    >
      <svg viewBox="0 0 28 28" width="16" height="16">
        <path fill="currentColor" d="M12.747 16.273h-7.46L18.925 1.5l-3.671 10.227h7.46L9.075 26.5l3.671-10.227z"/>
      </svg>
      在 StackBlitz 中打开
    </button>
    <div id="${elementId}"></div>
  `
}
