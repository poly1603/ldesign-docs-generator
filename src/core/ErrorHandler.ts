/**
 * 全局错误处理器
 * 统一处理应用中的所有错误
 */

import type { Logger } from '../types'

/**
 * 错误级别
 */
export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * 错误信息
 */
export interface ErrorInfo {
  level: ErrorLevel
  message: string
  stack?: string
  context?: Record<string, any>
  timestamp: number
}

/**
 * 错误处理器配置
 */
export interface ErrorHandlerConfig {
  /** 是否启用错误收集 */
  collectErrors?: boolean
  /** 最大错误数量 */
  maxErrors?: number
  /** 是否发送到远程 */
  sendToRemote?: boolean
  /** 远程URL */
  remoteUrl?: string
}

/**
 * 全局错误处理器
 */
export class ErrorHandler {
  private logger: Logger
  private config: Required<ErrorHandlerConfig>
  private errors: ErrorInfo[] = []

  constructor(logger: Logger, config: ErrorHandlerConfig = {}) {
    this.logger = logger
    this.config = {
      collectErrors: config.collectErrors !== false,
      maxErrors: config.maxErrors || 100,
      sendToRemote: config.sendToRemote || false,
      remoteUrl: config.remoteUrl || '',
    }

    // 注册全局错误处理
    this.registerGlobalHandlers()
  }

  /**
   * 注册全局错误处理器
   */
  private registerGlobalHandlers(): void {
    // 处理未捕获的错误
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleError({
          level: ErrorLevel.ERROR,
          message: event.message,
          stack: event.error?.stack,
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
          timestamp: Date.now(),
        })
      })

      // 处理未捕获的 Promise 拒绝
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError({
          level: ErrorLevel.ERROR,
          message: event.reason?.message || String(event.reason),
          stack: event.reason?.stack,
          context: {
            type: 'unhandled-rejection',
          },
          timestamp: Date.now(),
        })
      })
    }

    // Node.js 环境
    if (typeof process !== 'undefined') {
      process.on('uncaughtException', (error) => {
        this.handleError({
          level: ErrorLevel.FATAL,
          message: error.message,
          stack: error.stack,
          timestamp: Date.now(),
        })
      })

      process.on('unhandledRejection', (reason: any) => {
        this.handleError({
          level: ErrorLevel.ERROR,
          message: reason?.message || String(reason),
          stack: reason?.stack,
          timestamp: Date.now(),
        })
      })
    }
  }

  /**
   * 处理错误
   */
  handleError(errorInfo: ErrorInfo): void {
    // 记录日志
    switch (errorInfo.level) {
      case ErrorLevel.INFO:
        this.logger.info(errorInfo.message)
        break
      case ErrorLevel.WARNING:
        this.logger.warn(errorInfo.message)
        break
      case ErrorLevel.ERROR:
      case ErrorLevel.FATAL:
        this.logger.error(errorInfo.message, errorInfo.stack)
        break
    }

    // 收集错误
    if (this.config.collectErrors) {
      this.errors.push(errorInfo)

      // 限制错误数量
      if (this.errors.length > this.config.maxErrors) {
        this.errors.shift()
      }
    }

    // 发送到远程
    if (this.config.sendToRemote && this.config.remoteUrl) {
      this.sendErrorToRemote(errorInfo)
    }
  }

  /**
   * 发送错误到远程服务器
   */
  private async sendErrorToRemote(errorInfo: ErrorInfo): Promise<void> {
    try {
      await fetch(this.config.remoteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo),
      })
    } catch (error) {
      this.logger.warn('发送错误报告失败:', error)
    }
  }

  /**
   * 获取所有错误
   */
  getErrors(): ErrorInfo[] {
    return [...this.errors]
  }

  /**
   * 清除错误
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): Record<ErrorLevel, number> {
    const stats = {
      [ErrorLevel.INFO]: 0,
      [ErrorLevel.WARNING]: 0,
      [ErrorLevel.ERROR]: 0,
      [ErrorLevel.FATAL]: 0,
    }

    this.errors.forEach((error) => {
      stats[error.level]++
    })

    return stats
  }
}

/**
 * 创建错误处理器
 */
export function createErrorHandler(logger: Logger, config?: ErrorHandlerConfig): ErrorHandler {
  return new ErrorHandler(logger, config)
}

