/**
 * 自定义错误类
 */

/**
 * 文档生成器基础错误类
 */
export class DocsGeneratorError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'DocsGeneratorError'
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * 转换为 JSON
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      stack: this.stack,
    }
  }
}

/**
 * 插件错误
 */
export class PluginError extends DocsGeneratorError {
  constructor(
    public pluginName: string,
    message: string,
    details?: any
  ) {
    super('PLUGIN_ERROR', `Plugin ${pluginName}: ${message}`, details)
    this.name = 'PluginError'
  }
}

/**
 * 解析错误
 */
export class ParseError extends DocsGeneratorError {
  constructor(
    public file: string,
    message: string,
    details?: any
  ) {
    super('PARSE_ERROR', `Parse error in ${file}: ${message}`, details)
    this.name = 'ParseError'
  }
}

/**
 * 配置错误
 */
export class ConfigError extends DocsGeneratorError {
  constructor(message: string, details?: any) {
    super('CONFIG_ERROR', message, details)
    this.name = 'ConfigError'
  }
}

/**
 * 模板错误
 */
export class TemplateError extends DocsGeneratorError {
  constructor(
    public templateFile: string,
    message: string,
    details?: any
  ) {
    super('TEMPLATE_ERROR', `Template error in ${templateFile}: ${message}`, details)
    this.name = 'TemplateError'
  }
}

/**
 * 文件系统错误
 */
export class FileSystemError extends DocsGeneratorError {
  constructor(
    public path: string,
    message: string,
    details?: any
  ) {
    super('FS_ERROR', `File system error at ${path}: ${message}`, details)
    this.name = 'FileSystemError'
  }
}

/**
 * 验证错误
 */
export class ValidationError extends DocsGeneratorError {
  constructor(
    message: string,
    details?: any
  ) {
    super('VALIDATION_ERROR', message, details)
    this.name = 'ValidationError'
  }
}

/**
 * 错误代码枚举
 */
export enum ErrorCode {
  // 配置错误
  INVALID_CONFIG = 'INVALID_CONFIG',
  MISSING_CONFIG = 'MISSING_CONFIG',

  // 插件错误
  PLUGIN_LOAD_ERROR = 'PLUGIN_LOAD_ERROR',
  PLUGIN_EXECUTION_ERROR = 'PLUGIN_EXECUTION_ERROR',

  // 解析错误
  PARSE_ERROR = 'PARSE_ERROR',
  INVALID_SYNTAX = 'INVALID_SYNTAX',

  // 模板错误
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  TEMPLATE_RENDER_ERROR = 'TEMPLATE_RENDER_ERROR',

  // 文件系统错误
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  // 验证错误
  VALIDATION_FAILED = 'VALIDATION_FAILED',
}

/**
 * 错误处理工具
 */
export class ErrorHandler {
  /**
   * 格式化错误信息
   */
  static format(error: Error): string {
    if (error instanceof DocsGeneratorError) {
      let message = `[${error.code}] ${error.message}`

      if (error.details) {
        message += `\n\nDetails:\n${JSON.stringify(error.details, null, 2)}`
      }

      if (error.stack) {
        message += `\n\nStack Trace:\n${error.stack}`
      }

      return message
    }

    return error.message
  }

  /**
   * 创建友好的错误信息
   */
  static createFriendlyMessage(error: Error): string {
    if (error instanceof PluginError) {
      return `插件 "${error.pluginName}" 执行失败: ${error.message}\n\n建议: 检查插件配置和依赖项`
    }

    if (error instanceof ParseError) {
      return `文件解析失败: ${error.file}\n错误: ${error.message}\n\n建议: 检查文件语法和格式`
    }

    if (error instanceof ConfigError) {
      return `配置错误: ${error.message}\n\n建议: 检查 docs-generator.config.js 配置文件`
    }

    if (error instanceof TemplateError) {
      return `模板错误: ${error.templateFile}\n错误: ${error.message}\n\n建议: 检查模板语法`
    }

    if (error instanceof FileSystemError) {
      return `文件系统错误: ${error.path}\n错误: ${error.message}\n\n建议: 检查文件权限和路径`
    }

    if (error instanceof ValidationError) {
      return `验证失败: ${error.message}\n\n建议: 修复验证错误`
    }

    return error.message
  }

  /**
   * 处理错误并退出
   */
  static handleAndExit(error: Error, exitCode = 1): never {
    console.error('\n❌ 错误:\n')
    console.error(this.createFriendlyMessage(error))

    if (process.env.DEBUG) {
      console.error('\n调试信息:\n')
      console.error(this.format(error))
    }

    process.exit(exitCode)
  }
}




