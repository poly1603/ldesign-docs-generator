/**
 * 文件操作工具函数
 */

import * as fs from 'fs-extra'
import * as path from 'path'
import { glob } from 'glob'

/**
 * 复制目录
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest, {
    overwrite: true,
    errorOnExist: false,
  })
}

/**
 * 确保目录存在
 */
export async function ensureDir(dir: string): Promise<void> {
  await fs.ensureDir(dir)
}

/**
 * 读取匹配的文件列表
 */
export async function readFiles(
  pattern: string | string[],
  cwd: string,
  options?: {
    ignore?: string[]
  }
): Promise<string[]> {
  const patterns = Array.isArray(pattern) ? pattern : [pattern]
  const files: string[] = []

  for (const p of patterns) {
    const matches = await glob(p, {
      cwd,
      ignore: options?.ignore || [],
      absolute: true,
    })
    files.push(...matches)
  }

  // 去重
  return Array.from(new Set(files))
}

/**
 * 写入 JSON 文件
 */
export async function writeJSON(
  file: string,
  data: any,
  options?: {
    spaces?: number
  }
): Promise<void> {
  await fs.ensureDir(path.dirname(file))
  await fs.writeJSON(file, data, {
    spaces: options?.spaces || 2,
  })
}

/**
 * 读取 JSON 文件
 */
export async function readJSON<T = any>(file: string): Promise<T> {
  return await fs.readJSON(file)
}

/**
 * 检查文件是否存在
 */
export async function fileExists(file: string): Promise<boolean> {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

/**
 * 删除文件或目录
 */
export async function remove(path: string): Promise<void> {
  await fs.remove(path)
}

/**
 * 清空目录
 */
export async function emptyDir(dir: string): Promise<void> {
  await fs.emptyDir(dir)
}

/**
 * 获取文件大小
 */
export async function getFileSize(file: string): Promise<number> {
  const stats = await fs.stat(file)
  return stats.size
}

/**
 * 获取文件修改时间
 */
export async function getModifiedTime(file: string): Promise<Date> {
  const stats = await fs.stat(file)
  return stats.mtime
}




