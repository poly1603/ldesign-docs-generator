/**
 * CodePen 集成插件
 * 
 * 在文档中添加 "在 CodePen 中打开" 按钮
 */

import type { DocsPlugin, DocNode } from '../../types'

/**
 * CodePen 插件选项
 */
export interface CodePenPluginOptions {
  /** 用户名 */
  user?: string
  /** 是否私有 */
  private?: boolean
}

/**
 * CodePen 插件
 */
export function codepenPlugin(options: CodePenPluginOptions = {}): DocsPlugin {
  const { user = '', private: isPrivate = false } = options

  return {
    name: 'codepen',
    version: '1.0.0',
    description: 'CodePen 集成',

    /**
     * 转换文档，为示例添加 CodePen 表单数据
     */
    async transform(docs: DocNode[], context): Promise<DocNode[]> {
      const { logger } = context

      logger.debug('添加 CodePen 链接...')

      for (const doc of docs) {
        if (doc.type === 'component' && doc.content.examples) {
          for (const example of doc.content.examples) {
            // 生成 CodePen 数据
            const penData = generateCodePenData(
              example.code,
              doc.content.framework,
              doc.name
            )

            // 添加元数据
            example.codepen = {
              data: penData,
              user,
              private: isPrivate,
            }
          }

          doc.metadata.hasCodePen = true
        }
      }

      return docs
    },
  }
}

/**
 * 生成 CodePen 数据
 */
function generateCodePenData(
  code: string,
  framework: string,
  title: string
): Record<string, any> {
  const data: Record<string, any> = {
    title: `${title} Example`,
    description: `Example of ${title}`,
    tags: [framework, 'example'],
    editors: '101', // 只显示 HTML 和 JS
  }

  if (framework === 'vue') {
    data.html = '<div id="app"></div>'
    data.js = code
    data.js_external = 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js'
  } else if (framework === 'react') {
    data.html = '<div id="root"></div>'
    data.js = code
    data.js_external = [
      'https://unpkg.com/react@18/umd/react.production.min.js',
      'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    ].join(';')
    data.js_pre_processor = 'babel'
  } else {
    data.html = '<div id="app"></div>'
    data.js = code
  }

  return data
}

/**
 * 生成 CodePen 表单 HTML
 */
export function generateCodePenFormHTML(
  data: Record<string, any>,
  user?: string
): string {
  const JSONstring = JSON.stringify(data)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

  return `
    <form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form">
      <input type="hidden" name="data" value="${JSONstring}">
      <button type="submit" class="codepen-button">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M24 8.182l-.018-.087-.017-.05c-.01-.024-.018-.05-.03-.075-.003-.018-.015-.034-.02-.05l-.035-.067-.03-.05-.044-.06-.046-.045-.06-.045-.046-.03-.06-.044-.044-.04-.015-.02L12.58.19c-.347-.232-.796-.232-1.142 0L.453 7.502l-.015.015-.044.035-.06.05-.038.04-.05.056-.037.045-.05.06c-.02.017-.03.03-.03.046l-.05.06-.02.06c-.02.01-.02.04-.03.07l-.01.05C0 8.12 0 8.15 0 8.18v7.497c0 .044.003.09.01.135l.01.046c.005.03.01.06.02.086l.015.05c.01.027.016.053.027.075l.022.05c.01.025.02.047.035.07l.035.05.04.04.05.04.04.04.06.04.04.04.06.03.045.03.06.03.044.04L11.42 23.81c.174.116.375.174.576.174s.402-.058.576-.174l11.086-7.43.04-.027.06-.036.044-.032.06-.044.044-.04.05-.05.038-.042.05-.053.015-.02.05-.06.03-.07c.01-.02.017-.03.022-.05l.03-.07.01-.05c.01-.025.02-.05.02-.086l.01-.045.015-.135V8.18l-.02-.035zM12 10.868L8.777 8.182 12 5.496l3.223 2.686L12 10.868zm-1.142-6.14L5.615 8.182l-3.08-2.05L10.858 1.5v3.227zM3.4 9.618l2.15 1.43-2.15 1.43V9.617zm1.134 4.09l5.243 3.486v3.23L2.453 15.79l2.08-2.08zm7.377 6.716v-3.23l5.244-3.485 2.08 2.08-7.324 4.635zm7.132-6.135l-2.15-1.43 2.15-1.43v2.86z"/>
        </svg>
        在 CodePen 中打开
      </button>
    </form>
  `
}



