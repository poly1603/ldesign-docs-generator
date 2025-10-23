/**
 * 版本管理器
 * 
 * 管理文档的多个版本
 */

import fs from 'fs-extra'
import * as path from 'path'
import type { Logger, VersionInfo } from '../../types'

/**
 * 版本管理器选项
 */
export interface VersionManagerOptions {
  /** 日志器 */
  logger: Logger
  /** 输出目录 */
  outputDir: string
  /** 版本目录 */
  versionsDir?: string
  /** 当前版本 */
  currentVersion?: string
  /** 默认版本 */
  defaultVersion?: string
}

/**
 * 版本管理器
 */
export class VersionManager {
  private options: VersionManagerOptions
  private logger: Logger
  private versions: Map<string, VersionInfo> = new Map()

  constructor(options: VersionManagerOptions) {
    this.options = {
      versionsDir: 'versions',
      currentVersion: 'latest',
      defaultVersion: 'latest',
      ...options,
    }
    this.logger = options.logger
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    await this.loadVersions()
    this.logger.debug(`版本管理器已初始化，共 ${this.versions.size} 个版本`)
  }

  /**
   * 加载版本信息
   */
  private async loadVersions(): Promise<void> {
    const versionsFile = path.join(this.options.outputDir, 'versions.json')

    if (await fs.pathExists(versionsFile)) {
      try {
        const data = await fs.readJSON(versionsFile)
        if (Array.isArray(data)) {
          for (const version of data) {
            this.versions.set(version.version, version)
          }
        }
      } catch (error) {
        this.logger.warn('加载版本信息失败:', error)
      }
    }
  }

  /**
   * 添加版本
   */
  async addVersion(version: string, options?: Partial<VersionInfo>): Promise<void> {
    const versionInfo: VersionInfo = {
      version,
      path: `/${this.options.versionsDir}/${version}`,
      releaseDate: new Date().toISOString(),
      deprecated: false,
      ...options,
    }

    this.versions.set(version, versionInfo)
    await this.saveVersions()

    this.logger.info(`版本 ${version} 已添加`)
  }

  /**
   * 移除版本
   */
  async removeVersion(version: string): Promise<void> {
    if (!this.versions.has(version)) {
      this.logger.warn(`版本 ${version} 不存在`)
      return
    }

    this.versions.delete(version)
    await this.saveVersions()

    this.logger.info(`版本 ${version} 已移除`)
  }

  /**
   * 标记版本为废弃
   */
  async deprecateVersion(version: string): Promise<void> {
    const versionInfo = this.versions.get(version)
    if (!versionInfo) {
      this.logger.warn(`版本 ${version} 不存在`)
      return
    }

    versionInfo.deprecated = true
    await this.saveVersions()

    this.logger.info(`版本 ${version} 已标记为废弃`)
  }

  /**
   * 获取所有版本
   */
  getVersions(): VersionInfo[] {
    return Array.from(this.versions.values()).sort((a, b) => {
      // 按发布日期降序排序
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
      return dateB - dateA
    })
  }

  /**
   * 获取版本信息
   */
  getVersion(version: string): VersionInfo | undefined {
    return this.versions.get(version)
  }

  /**
   * 获取当前版本
   */
  getCurrentVersion(): string {
    return this.options.currentVersion || 'latest'
  }

  /**
   * 获取默认版本
   */
  getDefaultVersion(): string {
    return this.options.defaultVersion || 'latest'
  }

  /**
   * 生成版本切换器HTML
   */
  generateVersionSwitcher(): string {
    const versions = this.getVersions()
    const currentVersion = this.getCurrentVersion()

    if (versions.length <= 1) {
      return ''
    }

    const options = versions
      .map(v => {
        const deprecated = v.deprecated ? ' (已废弃)' : ''
        const selected = v.version === currentVersion ? ' selected' : ''
        return `<option value="${v.version}"${selected}>${v.version}${deprecated}</option>`
      })
      .join('\n')

    return `
      <div class="version-switcher">
        <label for="version-select">版本:</label>
        <select id="version-select" onchange="switchVersion(this.value)">
          ${options}
        </select>
      </div>
    `
  }

  /**
   * 保存版本信息
   */
  private async saveVersions(): Promise<void> {
    const versionsFile = path.join(this.options.outputDir, 'versions.json')
    const data = this.getVersions()

    await fs.ensureDir(path.dirname(versionsFile))
    await fs.writeJSON(versionsFile, data, { spaces: 2 })

    this.logger.debug('版本信息已保存')
  }

  /**
   * 归档版本
   */
  async archiveVersion(version: string, targetDir?: string): Promise<void> {
    const versionInfo = this.versions.get(version)
    if (!versionInfo) {
      throw new Error(`版本 ${version} 不存在`)
    }

    const sourceDir = path.join(this.options.outputDir)
    const archiveDir = targetDir || path.join(
      this.options.outputDir,
      this.options.versionsDir!,
      version
    )

    // 复制当前文档到归档目录
    await fs.ensureDir(archiveDir)
    await fs.copy(sourceDir, archiveDir, {
      filter: (src) => {
        // 排除 versions 目录和 versions.json
        return !src.includes('/versions/') && !src.endsWith('versions.json')
      },
    })

    this.logger.success(`版本 ${version} 已归档到 ${archiveDir}`)
  }
}



