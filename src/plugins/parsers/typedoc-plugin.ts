/**
 * TypeDoc 插件 - TypeScript API 文档解析
 */

import * as path from 'path'
import {
  Application,
  TSConfigReader,
  TypeDocReader,
  type DeclarationReflection,
  type Reflection,
  ReflectionKind,
  type ProjectReflection,
} from 'typedoc'
import type {
  DocsPlugin,
  ParseContext,
  ParseResult,
  APIDocNode,
  Signature,
  Parameter,
  TypeInfo,
  Comment,
} from '../../types'

/**
 * TypeDoc 插件选项
 */
export interface TypeDocPluginOptions {
  /** TypeScript 配置文件路径 */
  tsconfig?: string
  /** 入口文件 */
  entryPoints?: string[]
  /** 排除的文件 */
  exclude?: string[]
  /** 是否包含私有成员 */
  includePrivate?: boolean
  /** 是否包含内部成员 */
  includeInternal?: boolean
}

/**
 * TypeDoc 插件
 */
export class TypeDocPlugin implements DocsPlugin {
  name = 'typedoc'
  version = '1.0.0'
  private options: TypeDocPluginOptions

  constructor(options: TypeDocPluginOptions = {}) {
    this.options = options
  }

  /**
   * 解析 TypeScript 文件
   */
  async parse(context: ParseContext): Promise<ParseResult> {
    const { sourceDir, logger } = context
    const nodes: APIDocNode[] = []
    const errors: Error[] = []

    try {
      logger.debug('开始 TypeDoc 解析')

      // 创建 TypeDoc 应用
      const app = await Application.bootstrap({
        tsconfig: this.options.tsconfig || path.join(sourceDir, 'tsconfig.json'),
        entryPoints: this.options.entryPoints || [sourceDir],
        exclude: this.options.exclude || ['**/node_modules/**'],
        excludePrivate: !this.options.includePrivate,
        excludeInternal: !this.options.includeInternal,
      }, [
        new TSConfigReader(),
        new TypeDocReader(),
      ])

      // 转换项目
      const project = await app.convert()

      if (!project) {
        throw new Error('TypeDoc 转换失败')
      }

      // 提取文档节点
      this.extractNodes(project, nodes, sourceDir)

      logger.debug(`TypeDoc 解析完成，找到 ${nodes.length} 个 API 节点`)
    } catch (error) {
      logger.error('TypeDoc 解析失败:', error)
      errors.push(error as Error)
    }

    return { nodes, errors: errors.length > 0 ? errors : undefined }
  }

  /**
   * 提取文档节点
   */
  private extractNodes(
    project: ProjectReflection,
    nodes: APIDocNode[],
    sourceDir: string
  ): void {
    // 遍历所有反射
    for (const reflection of project.getReflectionsByKind(
      ReflectionKind.All
    )) {
      // 跳过项目本身
      if (reflection === project) continue

      // 转换为文档节点
      const node = this.convertReflection(reflection, sourceDir)
      if (node) {
        nodes.push(node)
      }
    }
  }

  /**
   * 转换反射为文档节点
   */
  private convertReflection(
    reflection: Reflection,
    sourceDir: string
  ): APIDocNode | null {
    if (!(reflection instanceof DeclarationReflection)) {
      return null
    }

    // 获取源文件路径
    const sources = reflection.sources || []
    const source = sources[0]
    const filePath = source
      ? path.relative(sourceDir, source.fileName)
      : 'unknown'

    // 提取注释
    const comment = this.extractComment(reflection)

    // 创建 API 文档节点
    const node: APIDocNode = {
      type: 'api',
      name: reflection.name,
      path: filePath,
      outputPath: this.generateOutputPath(reflection),
      metadata: {
        kind: ReflectionKind[reflection.kind],
        kindString: reflection.kindString,
        flags: reflection.flags,
        source: source
          ? {
            fileName: source.fileName,
            line: source.line,
            character: source.character,
          }
          : undefined,
      },
      content: {
        kind: reflection.kindString || 'Unknown',
        signatures: this.extractSignatures(reflection),
        comments: comment ? [comment] : undefined,
        deprecated: comment?.tags?.some((t) => t.tag === 'deprecated'),
        since: comment?.tags?.find((t) => t.tag === 'since')?.content,
      },
    }

    return node
  }

  /**
   * 提取签名
   */
  private extractSignatures(reflection: DeclarationReflection): Signature[] | undefined {
    if (!reflection.signatures) return undefined

    return reflection.signatures.map((sig) => ({
      name: sig.name,
      parameters: (sig.parameters || []).map((p) => this.extractParameter(p)),
      returnType: sig.type ? this.extractTypeInfo(sig.type) : { name: 'void', type: 'intrinsic' },
      comment: sig.comment ? this.extractComment({ comment: sig.comment } as any) : undefined,
    }))
  }

  /**
   * 提取参数
   */
  private extractParameter(param: any): Parameter {
    return {
      name: param.name,
      type: this.extractTypeInfo(param.type),
      optional: param.flags?.isOptional || false,
      defaultValue: param.defaultValue,
      description: param.comment?.summary?.[0]?.text || undefined,
    }
  }

  /**
   * 提取类型信息
   */
  private extractTypeInfo(type: any): TypeInfo {
    if (!type) {
      return { name: 'unknown', type: 'unknown' }
    }

    return {
      name: type.name || type.toString(),
      type: type.type || 'reference',
      raw: type.toString(),
    }
  }

  /**
   * 提取注释
   */
  private extractComment(reflection: { comment?: any }): Comment | undefined {
    if (!reflection.comment) return undefined

    const comment = reflection.comment

    return {
      summary: comment.summary?.map((s: any) => s.text).join('') || undefined,
      description: comment.summary?.map((s: any) => s.text).join('') || undefined,
      tags: comment.blockTags?.map((tag: any) => ({
        tag: tag.tag.substring(1), // 移除 @ 符号
        content: tag.content.map((c: any) => c.text).join(''),
      })) || undefined,
      examples: comment.blockTags
        ?.filter((tag: any) => tag.tag === '@example')
        .map((tag: any) => tag.content.map((c: any) => c.text).join('')) || undefined,
    }
  }

  /**
   * 生成输出路径
   */
  private generateOutputPath(reflection: DeclarationReflection): string {
    const parts: string[] = []
    let current: Reflection | undefined = reflection

    // 构建路径层级
    while (current && current.parent) {
      parts.unshift(current.name)
      current = current.parent
    }

    return `api/${parts.join('/')}.html`
  }
}

/**
 * 创建 TypeDoc 插件
 */
export function typedocPlugin(options?: TypeDocPluginOptions): TypeDocPlugin {
  return new TypeDocPlugin(options)
}




