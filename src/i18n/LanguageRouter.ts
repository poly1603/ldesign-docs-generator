/**
 * 语言路由器
 * 处理多语言路由和 URL 结构
 */

import * as path from 'path'

/**
 * 语言路由配置
 */
export interface LanguageRouterConfig {
  /** 默认语言 */
  defaultLocale: string
  /** 所有支持的语言 */
  locales: string[]
  /** 是否在默认语言的 URL 中包含语言前缀 */
  prefixDefault?: boolean
}

/**
 * 语言路由器
 */
export class LanguageRouter {
  private config: LanguageRouterConfig

  constructor(config: LanguageRouterConfig) {
    this.config = config
  }

  /**
   * 从路径中提取语言
   */
  getLocaleFromPath(pathname: string): { locale: string; pathWithoutLocale: string } {
    // 移除开头的斜杠
    const cleanPath = pathname.replace(/^\//, '')
    
    // 检查路径是否以语言代码开头
    const firstSegment = cleanPath.split('/')[0]
    
    if (this.config.locales.includes(firstSegment)) {
      const pathWithoutLocale = '/' + cleanPath.substring(firstSegment.length + 1)
      return {
        locale: firstSegment,
        pathWithoutLocale: pathWithoutLocale || '/',
      }
    }

    // 使用默认语言
    return {
      locale: this.config.defaultLocale,
      pathWithoutLocale: '/' + cleanPath,
    }
  }

  /**
   * 为路径添加语言前缀
   */
  localePath(pathname: string, locale: string): string {
    // 如果是默认语言且不需要前缀
    if (locale === this.config.defaultLocale && !this.config.prefixDefault) {
      return pathname
    }

    // 确保路径以斜杠开头
    const cleanPath = pathname.startsWith('/') ? pathname : '/' + pathname
    
    // 添加语言前缀
    return `/${locale}${cleanPath}`
  }

  /**
   * 获取切换到其他语言的路径
   */
  switchLocalePath(currentPath: string, targetLocale: string): string {
    const { pathWithoutLocale } = this.getLocaleFromPath(currentPath)
    return this.localePath(pathWithoutLocale, targetLocale)
  }

  /**
   * 生成所有语言的路径映射
   */
  generateLocalePathMap(basePath: string): Record<string, string> {
    const map: Record<string, string> = {}

    for (const locale of this.config.locales) {
      map[locale] = this.localePath(basePath, locale)
    }

    return map
  }

  /**
   * 判断路径是否是本地化路径
   */
  isLocalizedPath(pathname: string): boolean {
    const firstSegment = pathname.replace(/^\//, '').split('/')[0]
    return this.config.locales.includes(firstSegment)
  }

  /**
   * 获取路径对应的文件路径
   */
  getFilePath(pathname: string, sourceDir: string): { filePath: string; locale: string } {
    const { locale, pathWithoutLocale } = this.getLocaleFromPath(pathname)

    // 构建文件路径
    let filePath = path.join(sourceDir, pathWithoutLocale)

    // 如果路径以斜杠结尾或是根路径，添加 index.md
    if (pathWithoutLocale === '/' || pathWithoutLocale.endsWith('/')) {
      filePath = path.join(filePath, 'index.md')
    } else if (!path.extname(filePath)) {
      filePath += '.md'
    }

    return { filePath, locale }
  }
}

/**
 * 创建语言路由器
 */
export function createLanguageRouter(config: LanguageRouterConfig): LanguageRouter {
  return new LanguageRouter(config)
}


