/**
 * 模板加载工具
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import { fileURLToPath } from 'url'

// ESM 中获取当前目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 获取模板目录
 * 
 * 开发环境和打包后环境路径不同，需要智能检测
 */
export function getTemplateDir(): string {
  // 尝试多个可能的路径
  const possiblePaths = [
    // 开发环境：src/utils -> ../../templates
    path.join(__dirname, '../../templates'),
    // 打包后 ESM：es/utils -> ../../templates
    path.join(__dirname, '../../templates'),
    // 打包后 CJS：lib/utils -> ../../templates
    path.join(__dirname, '../../templates'),
    // 回退：从 node_modules 查找
    path.join(process.cwd(), 'node_modules/@ldesign/docs-generator/templates'),
    // 本地测试
    path.join(process.cwd(), 'templates'),
  ]

  for (const templatePath of possiblePaths) {
    if (fs.existsSync(templatePath)) {
      return templatePath
    }
  }

  throw new Error(
    `无法找到模板目录。尝试的路径:\n${possiblePaths.map((p) => `  - ${p}`).join('\n')}`
  )
}

/**
 * 确保模板目录可访问
 */
export async function ensureTemplates(targetDir?: string): Promise<string> {
  const templateDir = targetDir || getTemplateDir()

  // 检查默认主题是否存在
  const defaultTheme = path.join(templateDir, 'default')
  if (!(await fs.pathExists(defaultTheme))) {
    throw new Error(`默认主题不存在: ${defaultTheme}`)
  }

  // 检查关键模板文件
  const requiredTemplates = ['layout.ejs', 'index.ejs', 'component.ejs', 'api.ejs', 'markdown.ejs']
  for (const template of requiredTemplates) {
    const templatePath = path.join(defaultTheme, template)
    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`缺少模板文件: ${template}`)
    }
  }

  return templateDir
}



