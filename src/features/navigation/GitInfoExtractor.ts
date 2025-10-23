/**
 * Git 信息提取器
 * 从 Git 仓库提取文件的最后更新时间和贡献者信息
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'
import type { Logger } from '../../types'

const execAsync = promisify(exec)

/**
 * Git 贡献者信息
 */
export interface GitContributor {
  name: string
  email: string
  commits: number
  lastCommitDate: Date
}

/**
 * Git 文件信息
 */
export interface GitFileInfo {
  /** 最后更新时间 */
  lastUpdated: Date
  /** 最后更新的提交哈希 */
  lastCommitHash: string
  /** 最后更新的提交消息 */
  lastCommitMessage: string
  /** 贡献者列表 */
  contributors: GitContributor[]
  /** 文件创建时间 */
  created?: Date
  /** 总提交数 */
  totalCommits: number
}

/**
 * Git 信息提取器
 */
export class GitInfoExtractor {
  private repoPath: string
  private logger: Logger
  private cache: Map<string, GitFileInfo> = new Map()

  constructor(repoPath: string, logger: Logger) {
    this.repoPath = repoPath
    this.logger = logger
  }

  /**
   * 获取文件的 Git 信息
   */
  async getFileInfo(filePath: string, useCache = true): Promise<GitFileInfo | null> {
    const relativePath = path.relative(this.repoPath, filePath)

    // 检查缓存
    if (useCache && this.cache.has(relativePath)) {
      return this.cache.get(relativePath)!
    }

    try {
      // 获取最后更新时间
      const lastUpdated = await this.getLastUpdated(relativePath)

      // 获取最后提交信息
      const lastCommitInfo = await this.getLastCommitInfo(relativePath)

      // 获取贡献者列表
      const contributors = await this.getContributors(relativePath)

      // 获取文件创建时间
      const created = await this.getCreated(relativePath)

      // 获取总提交数
      const totalCommits = await this.getTotalCommits(relativePath)

      const info: GitFileInfo = {
        lastUpdated,
        lastCommitHash: lastCommitInfo.hash,
        lastCommitMessage: lastCommitInfo.message,
        contributors,
        created,
        totalCommits,
      }

      // 缓存结果
      this.cache.set(relativePath, info)

      return info
    } catch (error) {
      this.logger.error(`获取 Git 信息失败: ${relativePath}`, error)
      return null
    }
  }

  /**
   * 获取文件最后更新时间
   */
  private async getLastUpdated(filePath: string): Promise<Date> {
    const command = `git log -1 --format=%at -- "${filePath}"`
    const { stdout } = await execAsync(command, { cwd: this.repoPath })
    const timestamp = parseInt(stdout.trim(), 10)
    return new Date(timestamp * 1000)
  }

  /**
   * 获取最后提交信息
   */
  private async getLastCommitInfo(filePath: string): Promise<{ hash: string; message: string }> {
    const command = `git log -1 --format=%H%n%s -- "${filePath}"`
    const { stdout } = await execAsync(command, { cwd: this.repoPath })
    const [hash, message] = stdout.trim().split('\n')
    return { hash, message }
  }

  /**
   * 获取贡献者列表
   */
  private async getContributors(filePath: string): Promise<GitContributor[]> {
    const command = `git log --format=%an%x09%ae%x09%at -- "${filePath}"`
    const { stdout } = await execAsync(command, { cwd: this.repoPath })

    const contributorMap = new Map<string, GitContributor>()

    stdout.trim().split('\n').forEach((line) => {
      const [name, email, timestamp] = line.split('\t')
      const date = new Date(parseInt(timestamp, 10) * 1000)

      const key = email
      if (contributorMap.has(key)) {
        const contributor = contributorMap.get(key)!
        contributor.commits++
        if (date > contributor.lastCommitDate) {
          contributor.lastCommitDate = date
        }
      } else {
        contributorMap.set(key, {
          name,
          email,
          commits: 1,
          lastCommitDate: date,
        })
      }
    })

    // 按提交数排序
    return Array.from(contributorMap.values())
      .sort((a, b) => b.commits - a.commits)
  }

  /**
   * 获取文件创建时间
   */
  private async getCreated(filePath: string): Promise<Date> {
    const command = `git log --diff-filter=A --format=%at -- "${filePath}"`
    const { stdout } = await execAsync(command, { cwd: this.repoPath })
    const lines = stdout.trim().split('\n')
    const timestamp = parseInt(lines[lines.length - 1], 10)
    return new Date(timestamp * 1000)
  }

  /**
   * 获取文件的总提交数
   */
  private async getTotalCommits(filePath: string): Promise<number> {
    const command = `git log --oneline -- "${filePath}" | wc -l`
    const { stdout } = await execAsync(command, { cwd: this.repoPath })
    return parseInt(stdout.trim(), 10)
  }

  /**
   * 批量获取文件信息
   */
  async getMultipleFileInfo(filePaths: string[]): Promise<Map<string, GitFileInfo | null>> {
    const results = new Map<string, GitFileInfo | null>()

    // 并行获取所有文件信息
    await Promise.all(
      filePaths.map(async (filePath) => {
        const info = await this.getFileInfo(filePath)
        results.set(filePath, info)
      })
    )

    return results
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 检查是否在 Git 仓库中
   */
  async isGitRepository(): Promise<boolean> {
    try {
      await execAsync('git rev-parse --git-dir', { cwd: this.repoPath })
      return true
    } catch {
      return false
    }
  }
}

/**
 * 创建 Git 信息提取器
 */
export function createGitInfoExtractor(repoPath: string, logger: Logger): GitInfoExtractor {
  return new GitInfoExtractor(repoPath, logger)
}


