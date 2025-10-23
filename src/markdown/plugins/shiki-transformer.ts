/**
 * Shiki 代码转换器
 * 处理特殊注释标记：++/--/focus/error/warning
 */

/**
 * 代码行类型
 */
export type LineType = 'add' | 'remove' | 'focus' | 'error' | 'warning' | 'highlight' | 'normal'

/**
 * 代码行信息
 */
export interface LineInfo {
  content: string
  type: LineType
  lineNumber: number
}

/**
 * 转换配置
 */
export interface TransformerConfig {
  /** 是否启用差异高亮 */
  enableDiff?: boolean
  /** 是否启用聚焦 */
  enableFocus?: boolean
  /** 是否启用错误/警告 */
  enableDiagnostics?: boolean
}

/**
 * Shiki 转换器
 */
export class ShikiTransformer {
  private config: Required<TransformerConfig>

  constructor(config: TransformerConfig = {}) {
    this.config = {
      enableDiff: config.enableDiff !== false,
      enableFocus: config.enableFocus !== false,
      enableDiagnostics: config.enableDiagnostics !== false,
    }
  }

  /**
   * 转换代码，提取特殊标记
   */
  transformCode(code: string): { code: string; lines: LineInfo[] } {
    const lines = code.split('\n')
    const transformedLines: LineInfo[] = []
    let cleanCode = ''

    lines.forEach((line, index) => {
      let type: LineType = 'normal'
      let content = line

      // 检测 [!code ++] - 新增行
      if (this.config.enableDiff && /\/\/\s*\[!code \+\+\]/.test(line)) {
        type = 'add'
        content = line.replace(/\/\/\s*\[!code \+\+\]/, '').trimEnd()
      }
      // 检测 [!code --] - 删除行
      else if (this.config.enableDiff && /\/\/\s*\[!code --\]/.test(line)) {
        type = 'remove'
        content = line.replace(/\/\/\s*\[!code --\]/, '').trimEnd()
      }
      // 检测 [!code focus] - 聚焦行
      else if (this.config.enableFocus && /\/\/\s*\[!code focus\]/.test(line)) {
        type = 'focus'
        content = line.replace(/\/\/\s*\[!code focus\]/, '').trimEnd()
      }
      // 检测 [!code error] - 错误行
      else if (this.config.enableDiagnostics && /\/\/\s*\[!code error\]/.test(line)) {
        type = 'error'
        content = line.replace(/\/\/\s*\[!code error\]/, '').trimEnd()
      }
      // 检测 [!code warning] - 警告行
      else if (this.config.enableDiagnostics && /\/\/\s*\[!code warning\]/.test(line)) {
        type = 'warning'
        content = line.replace(/\/\/\s*\[!code warning\]/, '').trimEnd()
      }
      // 检测 [!code highlight] - 高亮行
      else if (/\/\/\s*\[!code highlight\]/.test(line)) {
        type = 'highlight'
        content = line.replace(/\/\/\s*\[!code highlight\]/, '').trimEnd()
      }

      transformedLines.push({
        content,
        type,
        lineNumber: index + 1,
      })

      cleanCode += content + '\n'
    })

    // 移除末尾的空行
    cleanCode = cleanCode.replace(/\n$/, '')

    return { code: cleanCode, lines: transformedLines }
  }

  /**
   * 将行信息应用到 HTML
   */
  applyLineTransforms(html: string, lines: LineInfo[]): string {
    // 分割 HTML 为行
    const htmlLines = html.split('\n')

    // 为每行添加类名和属性
    const transformedHtml = htmlLines.map((htmlLine, index) => {
      const lineInfo = lines[index]
      if (!lineInfo || lineInfo.type === 'normal') {
        return htmlLine
      }

      // 添加 data 属性和类名
      const className = `line-${lineInfo.type}`
      const dataAttr = `data-line-type="${lineInfo.type}"`

      // 包装行
      return `<span class="${className}" ${dataAttr}>${htmlLine}</span>`
    }).join('\n')

    return transformedHtml
  }

  /**
   * 生成带标记的 HTML
   */
  generateAnnotatedHtml(code: string, baseHtml: string): string {
    const { code: cleanCode, lines } = this.transformCode(code)

    // 应用转换到 HTML
    const transformedHtml = this.applyLineTransforms(baseHtml, lines)

    return transformedHtml
  }
}

/**
 * 创建转换器
 */
export function createShikiTransformer(config?: TransformerConfig): ShikiTransformer {
  return new ShikiTransformer(config)
}

/**
 * 差异和标记样式
 */
export const transformerStyles = `
/* 代码差异样式 */
.line-add {
  background-color: rgba(16, 185, 129, 0.15);
  border-left: 3px solid #10b981;
  display: block;
  margin-left: -1.5rem;
  padding-left: calc(1.5rem - 3px);
  margin-right: -1.5rem;
  padding-right: 1.5rem;
}

.line-add::before {
  content: '+';
  position: absolute;
  left: 0.5rem;
  color: #10b981;
  font-weight: 600;
}

.line-remove {
  background-color: rgba(239, 68, 68, 0.15);
  border-left: 3px solid #ef4444;
  display: block;
  margin-left: -1.5rem;
  padding-left: calc(1.5rem - 3px);
  margin-right: -1.5rem;
  padding-right: 1.5rem;
  opacity: 0.7;
  text-decoration: line-through;
}

.line-remove::before {
  content: '-';
  position: absolute;
  left: 0.5rem;
  color: #ef4444;
  font-weight: 600;
}

/* 聚焦样式 */
.line-focus {
  background-color: rgba(66, 185, 131, 0.1);
  display: block;
  margin-left: -1.5rem;
  padding-left: 1.5rem;
  margin-right: -1.5rem;
  padding-right: 1.5rem;
}

/* 错误样式 */
.line-error {
  background-color: rgba(239, 68, 68, 0.1);
  border-bottom: 2px wavy #ef4444;
  display: block;
}

.line-error::after {
  content: '❌';
  margin-left: 0.5rem;
  font-size: 0.875em;
}

/* 警告样式 */
.line-warning {
  background-color: rgba(245, 158, 11, 0.1);
  border-bottom: 2px wavy #f59e0b;
  display: block;
}

.line-warning::after {
  content: '⚠️';
  margin-left: 0.5rem;
  font-size: 0.875em;
}

/* 高亮样式 */
.line-highlight {
  background-color: rgba(66, 185, 131, 0.1);
  border-left: 3px solid #42b983;
  display: block;
  margin-left: -1.5rem;
  padding-left: calc(1.5rem - 3px);
  margin-right: -1.5rem;
  padding-right: 1.5rem;
}
`

