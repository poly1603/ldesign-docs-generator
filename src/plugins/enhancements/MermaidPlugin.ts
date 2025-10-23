/**
 * Mermaid 图表插件
 * 
 * 支持在 Markdown 中渲染 Mermaid 图表
 */

import type { DocsPlugin, DocNode, ParseContext } from '../../types'

/**
 * Mermaid 插件选项
 */
export interface MermaidPluginOptions {
  /** Mermaid 主题 */
  theme?: 'default' | 'forest' | 'dark' | 'neutral'
  /** 是否在构建时预渲染 */
  preRender?: boolean
  /** 自定义配置 */
  config?: Record<string, any>
}

/**
 * Mermaid 插件
 */
export function mermaidPlugin(options: MermaidPluginOptions = {}): DocsPlugin {
  const { theme = 'default', preRender = false, config = {} } = options

  return {
    name: 'mermaid',
    version: '1.0.0',
    description: 'Mermaid 图表支持',

    /**
     * 转换文档节点，处理 Mermaid 代码块
     */
    async transform(docs: DocNode[], context: ParseContext): Promise<DocNode[]> {
      const { logger } = context

      logger.debug('处理 Mermaid 图表...')

      let chartCount = 0

      for (const doc of docs) {
        if (doc.type === 'markdown' && doc.content.raw) {
          // 查找 Mermaid 代码块
          const mermaidBlocks = extractMermaidBlocks(doc.content.raw)

          if (mermaidBlocks.length > 0) {
            chartCount += mermaidBlocks.length

            // 标记文档包含 Mermaid
            doc.metadata.hasMermaid = true
            doc.metadata.mermaidBlocks = mermaidBlocks

            // 转换 HTML 中的 Mermaid 代码块
            if (doc.content.html) {
              doc.content.html = transformMermaidInHTML(doc.content.html, mermaidBlocks)
            }
          }
        }
      }

      if (chartCount > 0) {
        logger.info(`处理了 ${chartCount} 个 Mermaid 图表`)
      }

      return docs
    },

    /**
     * 生成时注入 Mermaid 脚本
     */
    async afterGenerate(context): Promise<void> {
      const { docs, logger } = context

      // 检查是否有文档包含 Mermaid
      const hasMermaid = docs.some(doc => doc.metadata.hasMermaid)

      if (hasMermaid) {
        logger.info('文档包含 Mermaid 图表，需在模板中引入 Mermaid 库')

        // 可以在这里生成配置文件或注入脚本
        // 实际使用时在模板中添加：
        // <script type="module">
        //   import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        //   mermaid.initialize({ startOnLoad: true, theme: '${theme}' });
        // </script>
      }
    },
  }
}

/**
 * 提取 Mermaid 代码块
 */
function extractMermaidBlocks(markdown: string): string[] {
  const blocks: string[] = []
  const regex = /```mermaid\n([\s\S]*?)```/g
  let match

  while ((match = regex.exec(markdown)) !== null) {
    blocks.push(match[1].trim())
  }

  return blocks
}

/**
 * 转换 HTML 中的 Mermaid 代码块
 */
function transformMermaidInHTML(html: string, blocks: string[]): string {
  let transformed = html
  let blockIndex = 0

  // 将 <pre><code class="language-mermaid"> 转换为 <div class="mermaid">
  transformed = transformed.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_, code) => {
      const decodedCode = decodeHtmlEntities(code)
      return `<div class="mermaid">\n${decodedCode}\n</div>`
    }
  )

  return transformed
}

/**
 * 解码 HTML 实体
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}



