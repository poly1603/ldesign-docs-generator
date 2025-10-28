/**
 * 运行模式类型定义
 */

export type RunMode = 'dev' | 'build' | 'generate'

export type BuildMode = 'spa' | 'ssg' | 'hybrid'

/**
 * 模式配置
 */
export interface ModeConfig {
  /** 运行模式 */
  mode: RunMode
  
  /** 构建模式 */
  buildMode: BuildMode
  
  /** 是否启用 SPA 路由 */
  enableSpaRouting: boolean
  
  /** 是否预渲染 */
  prerender: boolean
  
  /** 是否启用 SSR */
  ssr: boolean
}

/**
 * 开发模式配置
 */
export interface DevModeConfig extends ModeConfig {
  mode: 'dev'
  buildMode: 'spa'
  enableSpaRouting: true
  prerender: false
  ssr: false
}

/**
 * 构建模式配置
 */
export interface BuildModeConfig extends ModeConfig {
  mode: 'build'
  buildMode: 'hybrid' | 'spa' | 'ssg'
  prerender: boolean
  ssr: boolean
}

/**
 * 生成模式配置 (兼容旧版)
 */
export interface GenerateModeConfig extends ModeConfig {
  mode: 'generate'
  buildMode: 'ssg'
  enableSpaRouting: false
  prerender: false
  ssr: false
}

/**
 * 获取默认模式配置
 */
export function getDefaultModeConfig(mode: RunMode): ModeConfig {
  switch (mode) {
    case 'dev':
      return {
        mode: 'dev',
        buildMode: 'spa',
        enableSpaRouting: true,
        prerender: false,
        ssr: false,
      }
    
    case 'build':
      return {
        mode: 'build',
        buildMode: 'hybrid',
        enableSpaRouting: true,
        prerender: true,
        ssr: true,
      }
    
    case 'generate':
      return {
        mode: 'generate',
        buildMode: 'ssg',
        enableSpaRouting: false,
        prerender: false,
        ssr: false,
      }
  }
}
