/**
 * 路径处理工具函数
 */

import * as path from 'path'

/**
 * 规范化路径（转换为 Unix 风格）
 */
export function normalizePath(p: string): string {
  return p.replace(/\\/g, '/')
}

/**
 * 获取相对路径
 */
export function getRelativePath(from: string, to: string): string {
  const relativePath = path.relative(from, to)
  return normalizePath(relativePath)
}

/**
 * 解析输出路径
 */
export function resolveOutputPath(docType: string, name: string, ext = '.html'): string {
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')

  switch (docType) {
    case 'api':
      return `api/${safeName}${ext}`
    case 'component':
      return `components/${safeName}${ext}`
    case 'markdown':
      return `docs/${safeName}${ext}`
    default:
      return `${safeName}${ext}`
  }
}

/**
 * 确保路径以斜杠结尾
 */
export function ensureTrailingSlash(p: string): string {
  return p.endsWith('/') ? p : `${p}/`
}

/**
 * 移除路径开头的斜杠
 */
export function removeLeadingSlash(p: string): string {
  return p.startsWith('/') ? p.slice(1) : p
}

/**
 * 移除路径结尾的斜杠
 */
export function removeTrailingSlash(p: string): string {
  return p.endsWith('/') ? p.slice(0, -1) : p
}

/**
 * 拼接 URL 路径
 */
export function joinUrlPath(...parts: string[]): string {
  return parts
    .map((part, index) => {
      if (index === 0) {
        return removeTrailingSlash(part)
      }
      return removeLeadingSlash(removeTrailingSlash(part))
    })
    .filter(Boolean)
    .join('/')
}

/**
 * 获取文件名（不含扩展名）
 */
export function getBaseName(filePath: string, includeExt = false): string {
  const basename = path.basename(filePath)
  if (includeExt) {
    return basename
  }
  return basename.replace(/\.[^.]+$/, '')
}

/**
 * 获取扩展名
 */
export function getExtension(filePath: string): string {
  return path.extname(filePath)
}

/**
 * 是否是绝对路径
 */
export function isAbsolutePath(p: string): boolean {
  return path.isAbsolute(p)
}

/**
 * 转换为绝对路径
 */
export function toAbsolutePath(p: string, base?: string): string {
  if (isAbsolutePath(p)) {
    return p
  }
  return path.resolve(base || process.cwd(), p)
}




