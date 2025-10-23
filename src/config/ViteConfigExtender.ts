/**
 * Vite 配置扩展器
 * 扩展和合并 Vite 配置
 */

import type { InlineConfig as ViteConfig, Plugin } from 'vite'
import type { Logger } from '../types'

/**
 * Vite 配置扩展选项
 */
export interface ViteConfigExtenderOptions {
  /** 基础配置 */
  base: ViteConfig
  /** 用户配置 */
  user?: ViteConfig
  /** 额外插件 */
  plugins?: Plugin[]
  /** 日志器 */
  logger: Logger
}

/**
 * Vite 配置扩展器
 */
export class ViteConfigExtender {
  private options: ViteConfigExtenderOptions

  constructor(options: ViteConfigExtenderOptions) {
    this.options = options
  }

  /**
   * 扩展配置
   */
  extend(): ViteConfig {
    const { base, user = {}, plugins = [], logger } = this.options

    // 深度合并配置
    const merged: ViteConfig = {
      ...base,
      ...user,

      // 合并插件
      plugins: [
        ...(base.plugins || []),
        ...plugins,
        ...(user.plugins || []),
      ],

      // 合并服务器配置
      server: {
        ...base.server,
        ...user.server,
      },

      // 合并构建配置
      build: {
        ...base.build,
        ...user.build,
        rollupOptions: {
          ...base.build?.rollupOptions,
          ...user.build?.rollupOptions,
          output: {
            ...base.build?.rollupOptions?.output,
            ...user.build?.rollupOptions?.output,
          },
        },
      },

      // 合并解析配置
      resolve: {
        ...base.resolve,
        ...user.resolve,
        alias: {
          ...base.resolve?.alias,
          ...user.resolve?.alias,
        },
      },

      // 合并优化配置
      optimizeDeps: {
        ...base.optimizeDeps,
        ...user.optimizeDeps,
        include: [
          ...(base.optimizeDeps?.include || []),
          ...(user.optimizeDeps?.include || []),
        ],
        exclude: [
          ...(base.optimizeDeps?.exclude || []),
          ...(user.optimizeDeps?.exclude || []),
        ],
      },
    }

    logger.debug('Vite 配置已扩展')

    return merged
  }

  /**
   * 验证配置
   */
  validate(config: ViteConfig): boolean {
    const { logger } = this.options

    // 检查必要字段
    if (!config.root) {
      logger.warn('Vite 配置缺少 root 字段')
    }

    // 检查插件冲突
    if (config.plugins) {
      const pluginNames = config.plugins
        .filter((p): p is Plugin => p !== null && p !== undefined)
        .map((p) => p.name)

      const duplicates = pluginNames.filter((name, index) => pluginNames.indexOf(name) !== index)

      if (duplicates.length > 0) {
        logger.warn(`检测到重复的 Vite 插件: ${duplicates.join(', ')}`)
      }
    }

    return true
  }

  /**
   * 优化配置
   */
  optimize(config: ViteConfig): ViteConfig {
    const { logger } = this.options

    // 生产环境优化
    if (config.mode === 'production' || process.env.NODE_ENV === 'production') {
      config.build = config.build || {}

      // 启用压缩
      if (config.build.minify === undefined) {
        config.build.minify = 'terser'
      }

      // 启用 sourcemap（可选）
      if (config.build.sourcemap === undefined) {
        config.build.sourcemap = false
      }

      // 优化块大小
      if (!config.build.chunkSizeWarningLimit) {
        config.build.chunkSizeWarningLimit = 500
      }

      logger.debug('已应用生产环境优化')
    }

    return config
  }
}

/**
 * 创建 Vite 配置扩展器
 */
export function createViteConfigExtender(options: ViteConfigExtenderOptions): ViteConfigExtender {
  return new ViteConfigExtender(options)
}

/**
 * 合并多个 Vite 配置
 */
export function mergeViteConfigs(...configs: ViteConfig[]): ViteConfig {
  return configs.reduce((merged, config) => {
    return {
      ...merged,
      ...config,
      plugins: [
        ...(merged.plugins || []),
        ...(config.plugins || []),
      ],
      server: { ...merged.server, ...config.server },
      build: { ...merged.build, ...config.build },
      resolve: {
        ...merged.resolve,
        ...config.resolve,
        alias: { ...merged.resolve?.alias, ...config.resolve?.alias },
      },
    }
  }, {} as ViteConfig)
}


