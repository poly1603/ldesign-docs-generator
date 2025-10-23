/**
 * 文档生成器日志器
 */

import type { Logger as ILogger } from '../types'

/**
 * 日志级别
 */
export enum LogLevel {
  Silent = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
}

/**
 * 日志器实现
 */
export class Logger implements ILogger {
  private level: LogLevel
  private prefix: string

  constructor(level: LogLevel = LogLevel.Info, prefix = '[docs-generator]') {
    this.level = level
    this.prefix = prefix
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level
  }

  /**
   * 格式化消息
   */
  private format(level: string, message: string): string {
    const timestamp = new Date().toLocaleTimeString()
    return `${this.prefix} ${timestamp} ${level} ${message}`
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.Info) {
      console.log(this.format('ℹ', message), ...args)
    }
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.Warn) {
      console.warn(this.format('⚠', message), ...args)
    }
  }

  /**
   * 错误日志
   */
  error(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.Error) {
      console.error(this.format('✖', message), ...args)
    }
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.Debug) {
      console.log(this.format('🐛', message), ...args)
    }
  }

  /**
   * 成功日志
   */
  success(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.Info) {
      console.log(this.format('✓', message), ...args)
    }
  }

  /**
   * 创建子日志器
   */
  createChild(prefix: string): Logger {
    return new Logger(this.level, `${this.prefix}:${prefix}`)
  }
}

/**
 * 将字符串转换为日志级别
 */
export function parseLogLevel(level?: string): LogLevel {
  switch (level?.toLowerCase()) {
    case 'silent':
      return LogLevel.Silent
    case 'error':
      return LogLevel.Error
    case 'warn':
      return LogLevel.Warn
    case 'info':
      return LogLevel.Info
    case 'debug':
      return LogLevel.Debug
    default:
      return LogLevel.Info
  }
}




