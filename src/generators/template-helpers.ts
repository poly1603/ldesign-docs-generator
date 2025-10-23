/**
 * 模板辅助函数
 */

import * as path from 'path'

/**
 * 模板辅助函数集合
 */
export const templateHelpers = {
  /**
   * 格式化日期
   */
  formatDate(date: Date | string | number, format = 'YYYY-MM-DD'): string {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
  },

  /**
   * 转义 HTML
   */
  escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (char) => map[char])
  },

  /**
   * 截断文本
   */
  truncate(text: string, length: number, suffix = '...'): string {
    if (text.length <= length) {
      return text
    }
    return text.slice(0, length) + suffix
  },

  /**
   * 相对路径
   */
  relativePath(from: string, to: string): string {
    const rel = path.relative(path.dirname(from), to)
    return rel.replace(/\\/g, '/')
  },

  /**
   * 首字母大写
   */
  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
  },

  /**
   * 转为 kebab-case
   */
  kebabCase(text: string): string {
    return text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  },

  /**
   * 转为 camelCase
   */
  camelCase(text: string): string {
    return text
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^[A-Z]/, (char) => char.toLowerCase())
  },

  /**
   * 转为 PascalCase
   */
  pascalCase(text: string): string {
    return text
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^[a-z]/, (char) => char.toUpperCase())
  },

  /**
   * 格式化文件大小
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  },

  /**
   * 数组转逗号分隔字符串
   */
  join(array: any[], separator = ', '): string {
    return array.join(separator)
  },

  /**
   * 是否为空
   */
  isEmpty(value: any): boolean {
    if (value == null) return true
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    if (typeof value === 'string') return value.trim().length === 0
    return false
  },

  /**
   * 默认值
   */
  default(value: any, defaultValue: any): any {
    return value != null ? value : defaultValue
  },

  /**
   * JSON 字符串化
   */
  json(value: any, spaces = 2): string {
    try {
      return JSON.stringify(value, null, spaces)
    } catch {
      return String(value)
    }
  },

  /**
   * 安全的 URL 编码
   */
  urlEncode(text: string): string {
    return encodeURIComponent(text)
  },

  /**
   * 高亮搜索关键词
   */
  highlight(text: string, keyword: string): string {
    if (!keyword) return text
    const regex = new RegExp(`(${keyword})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  },

  /**
   * 移除 HTML 标签
   */
  stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '')
  },

  /**
   * 换行符转 <br>
   */
  nl2br(text: string): string {
    return text.replace(/\n/g, '<br>')
  },

  /**
   * 生成随机 ID
   */
  randomId(prefix = 'id'): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`
  },

  /**
   * 数字格式化
   */
  formatNumber(num: number, decimals = 0): string {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  /**
   * 百分比格式化
   */
  percentage(num: number, total: number, decimals = 2): string {
    if (total === 0) return '0%'
    return `${((num / total) * 100).toFixed(decimals)}%`
  },
}

/**
 * 注册辅助函数到模板引擎
 */
export function registerTemplateHelpers(): Record<string, Function> {
  return templateHelpers
}




