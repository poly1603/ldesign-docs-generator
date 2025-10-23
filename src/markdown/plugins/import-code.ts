/**
 * 代码导入插件
 * 支持 @[code](./file.ts) 和 @[code{1-10}](./file.ts) 语法
 */

import type MarkdownIt from 'markdown-it'
import * as fs from 'fs-extra'
import * as path from 'path'

/**
 * 代码导入配置
 */
export interface ImportCodeConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 源目录（用于解析相对路径）*/
  sourceDir: string
}

/**
 * 应用代码导入插件
 */
export function applyImportCode(md: MarkdownIt, config: ImportCodeConfig): void {
  if (config.enabled === false) {
    return
  }

  const { sourceDir } = config

  // 添加自定义规则
  md.inline.ruler.before('emphasis', 'import_code', (state, silent) => {
    const start = state.pos
    const max = state.posMax

    // 检查是否以 @[code 开头
    if (state.src.charCodeAt(start) !== 0x40 /* @ */) {
      return false
    }

    if (state.src.slice(start, start + 6) !== '@[code') {
      return false
    }

    // 查找结束位置
    let pos = start + 6
    let lineRange: string | null = null

    // 检查是否有行范围 {1-10}
    if (state.src.charCodeAt(pos) === 0x7b /* { */) {
      const rangeEnd = state.src.indexOf('}', pos)
      if (rangeEnd !== -1) {
        lineRange = state.src.slice(pos + 1, rangeEnd)
        pos = rangeEnd + 1
      }
    }

    // 检查是否有 ](
    if (state.src.slice(pos, pos + 2) !== '](') {
      return false
    }

    pos += 2

    // 查找文件路径结束位置
    const pathEnd = state.src.indexOf(')', pos)
    if (pathEnd === -1) {
      return false
    }

    const filePath = state.src.slice(pos, pathEnd)

    if (!silent) {
      // 读取文件内容
      const fullPath = path.resolve(sourceDir, filePath)
      let code = ''
      let lang = path.extname(filePath).slice(1) || 'text'

      try {
        const content = fs.readFileSync(fullPath, 'utf-8')
        
        // 如果有行范围，提取指定行
        if (lineRange) {
          const lines = content.split('\n')
          const [start, end] = parseLineRange(lineRange, lines.length)
          code = lines.slice(start - 1, end).join('\n')
        } else {
          code = content
        }
      } catch (error) {
        code = `// 无法读取文件: ${filePath}\n// ${error}`
      }

      // 创建 token
      const token = state.push('fence', 'code', 0)
      token.info = lang
      token.content = code
      token.markup = '```'
      token.map = [state.line, state.line + 1]
    }

    state.pos = pathEnd + 1
    return true
  })
}

/**
 * 解析行范围
 * 例如: "1-10" => [1, 10], "5" => [5, 5]
 */
function parseLineRange(range: string, totalLines: number): [number, number] {
  if (range.includes('-')) {
    const [start, end] = range.split('-').map((n) => parseInt(n.trim(), 10))
    return [
      Math.max(1, start),
      Math.min(totalLines, end),
    ]
  }

  const line = parseInt(range, 10)
  return [line, line]
}

/**
 * 使用示例
 */
export const importCodeExample = `
# 导入代码示例

导入整个文件:
@[code](./example.ts)

导入指定行:
@[code{1-10}](./example.ts)

导入单行:
@[code{5}](./example.ts)
`


