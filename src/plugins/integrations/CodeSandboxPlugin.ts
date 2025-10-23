/**
 * CodeSandbox 集成插件
 * 
 * 在文档中添加 "在 CodeSandbox 中打开" 按钮
 */

import type { DocsPlugin, DocNode } from '../../types'

/**
 * CodeSandbox 插件选项
 */
export interface CodeSandboxPluginOptions {
  /** 默认模板 */
  template?: 'vue' | 'react' | 'vanilla'
  /** 自动打开 */
  autoOpen?: boolean
}

/**
 * CodeSandbox 插件
 */
export function codesandboxPlugin(options: CodeSandboxPluginOptions = {}): DocsPlugin {
  const { template = 'vue', autoOpen = false } = options

  return {
    name: 'codesandbox',
    version: '1.0.0',
    description: 'CodeSandbox 集成',

    /**
     * 转换文档，为示例添加 CodeSandbox 链接
     */
    async transform(docs: DocNode[], context): Promise<DocNode[]> {
      const { logger } = context

      logger.debug('添加 CodeSandbox 链接...')

      for (const doc of docs) {
        if (doc.type === 'component' && doc.content.examples) {
          for (const example of doc.content.examples) {
            // 生成 CodeSandbox 参数
            const sandboxParams = generateSandboxParams(
              example.code,
              doc.content.framework || template
            )

            // 添加元数据
            example.codesandbox = {
              url: `https://codesandbox.io/api/v1/sandboxes/define?parameters=${sandboxParams}`,
              autoOpen,
            }
          }

          doc.metadata.hasCodeSandbox = true
        }
      }

      return docs
    },
  }
}

/**
 * 生成 CodeSandbox 参数
 */
function generateSandboxParams(code: string, framework: string): string {
  let files: Record<string, { content: string; isBinary?: boolean }> = {}

  if (framework === 'vue') {
    files = {
      'package.json': {
        content: JSON.stringify({
          name: 'vue-example',
          version: '1.0.0',
          dependencies: {
            vue: '^3.3.0',
          },
        }, null, 2),
      },
      'index.html': {
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue Example</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`,
      },
      'src/main.js': {
        content: `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
      },
      'src/App.vue': {
        content: code,
      },
    }
  } else if (framework === 'react') {
    files = {
      'package.json': {
        content: JSON.stringify({
          name: 'react-example',
          version: '1.0.0',
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
          },
        }, null, 2),
      },
      'public/index.html': {
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Example</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`,
      },
      'src/index.js': {
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)`,
      },
      'src/App.js': {
        content: code,
      },
    }
  }

  // 简单的base64编码生成parameters
  return Buffer.from(JSON.stringify({ files })).toString('base64')
}


