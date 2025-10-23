/**
 * Vue 组件解析插件
 */

import * as fs from 'fs-extra'
import * as path from 'path'
import { parse, compileScript } from '@vue/compiler-sfc'
import type {
  DocsPlugin,
  ParseContext,
  ParseResult,
  ComponentDocNode,
  PropInfo,
  EventInfo,
  SlotInfo,
  Example,
} from '../../types'

/**
 * Vue 组件插件选项
 */
export interface VueComponentPluginOptions {
  /** 包含的文件模式 */
  include?: string | string[]
  /** 排除的文件模式 */
  exclude?: string | string[]
}

/**
 * Vue 组件插件
 */
export class VueComponentPlugin implements DocsPlugin {
  name = 'vue-component'
  version = '1.0.0'
  private options: VueComponentPluginOptions

  constructor(options: VueComponentPluginOptions = {}) {
    this.options = {
      include: options.include || '**/*.vue',
      exclude: options.exclude || '**/node_modules/**',
    }
  }

  /**
   * 解析 Vue 组件
   */
  async parse(context: ParseContext): Promise<ParseResult> {
    const { files, sourceDir, logger } = context
    const nodes: ComponentDocNode[] = []
    const errors: Error[] = []

    // 过滤 Vue 文件
    const vueFiles = files.filter((file) => file.endsWith('.vue'))

    logger.debug(`找到 ${vueFiles.length} 个 Vue 组件文件`)

    for (const file of vueFiles) {
      try {
        const node = await this.parseVueFile(file, sourceDir)
        if (node) {
          nodes.push(node)
        }
      } catch (error) {
        logger.error(`解析 Vue 文件失败: ${file}`, error)
        errors.push(error as Error)
      }
    }

    logger.debug(`Vue 组件解析完成，共 ${nodes.length} 个组件`)

    return { nodes, errors: errors.length > 0 ? errors : undefined }
  }

  /**
   * 解析单个 Vue 文件
   */
  private async parseVueFile(
    filePath: string,
    sourceDir: string
  ): Promise<ComponentDocNode | null> {
    // 读取文件内容
    const content = await fs.readFile(filePath, 'utf-8')

    // 解析 SFC
    const { descriptor, errors } = parse(content, {
      filename: filePath,
    })

    if (errors.length > 0) {
      throw new Error(`SFC 解析错误: ${errors.map((e) => e.message).join(', ')}`)
    }

    // 提取组件名称
    const componentName = this.extractComponentName(filePath, descriptor)

    // 编译 script
    let props: PropInfo[] = []
    let events: EventInfo[] = []
    let scriptContent = ''

    if (descriptor.script || descriptor.scriptSetup) {
      try {
        const compiled = compileScript(descriptor, {
          id: componentName,
        })
        scriptContent = compiled.content

        // 提取 Props
        props = this.extractProps(compiled.content, descriptor)

        // 提取 Events
        events = this.extractEvents(compiled.content, descriptor)
      } catch (error) {
        // 编译失败，使用基础解析
        props = this.extractPropsFromSource(descriptor.script?.content || descriptor.scriptSetup?.content || '')
      }
    }

    // 提取 Slots
    const slots = this.extractSlots(descriptor.template?.content || '')

    // 提取示例
    const examples = this.extractExamples(descriptor)

    // 提取描述
    const description = this.extractDescription(descriptor)

    // 创建组件文档节点
    const node: ComponentDocNode = {
      type: 'component',
      name: componentName,
      path: path.relative(sourceDir, filePath),
      outputPath: `components/${componentName}.html`,
      metadata: {
        framework: 'vue',
        hasScript: !!descriptor.script || !!descriptor.scriptSetup,
        hasTemplate: !!descriptor.template,
        hasStyle: descriptor.styles.length > 0,
        scriptSetup: !!descriptor.scriptSetup,
      },
      content: {
        framework: 'vue',
        props,
        events,
        slots,
        examples,
        description,
      },
    }

    return node
  }

  /**
   * 提取组件名称
   */
  private extractComponentName(filePath: string, descriptor: any): string {
    // 从文件名提取
    const fileName = path.basename(filePath, '.vue')

    // 尝试从 script 中提取 name
    const scriptContent = descriptor.script?.content || descriptor.scriptSetup?.content || ''
    const nameMatch = scriptContent.match(/name\s*:\s*['"](.+?)['"]/);
    if (nameMatch) {
      return nameMatch[1]
    }

    // 转换为 PascalCase
    return fileName
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  }

  /**
   * 提取 Props
   */
  private extractProps(scriptContent: string, descriptor: any): PropInfo[] {
    const props: PropInfo[] = []

    // 方式 1: defineProps (script setup)
    const definePropsMatch = scriptContent.match(
      /defineProps\s*<\s*\{([^}]+)\}\s*>\s*\(\)/
    )
    if (definePropsMatch) {
      const propsContent = definePropsMatch[1]
      const propMatches = propsContent.matchAll(
        /(\w+)\s*\??\s*:\s*([^;\n]+)/g
      )
      for (const match of propMatches) {
        props.push({
          name: match[1],
          type: match[2].trim(),
          required: !match[0].includes('?'),
        })
      }
    }

    // 方式 2: props 对象 (options API)
    const propsObjectMatch = scriptContent.match(
      /props\s*:\s*\{([^}]+)\}/s
    )
    if (propsObjectMatch) {
      const propsContent = propsObjectMatch[1]
      const propMatches = propsContent.matchAll(
        /(\w+)\s*:\s*\{([^}]+)\}/gs
      )
      for (const match of propMatches) {
        const propConfig = match[2]
        const typeMatch = propConfig.match(/type\s*:\s*(\w+)/)
        const requiredMatch = propConfig.match(/required\s*:\s*(true|false)/)
        const defaultMatch = propConfig.match(/default\s*:\s*(.+?)[,\n]/)

        props.push({
          name: match[1],
          type: typeMatch ? typeMatch[1] : 'any',
          required: requiredMatch ? requiredMatch[1] === 'true' : false,
          defaultValue: defaultMatch ? defaultMatch[1].trim() : undefined,
        })
      }
    }

    return props
  }

  /**
   * 从源代码提取 Props（简单版本）
   */
  private extractPropsFromSource(scriptContent: string): PropInfo[] {
    const props: PropInfo[] = []

    // 简单的正则匹配
    const matches = scriptContent.matchAll(/(\w+)\s*:\s*\{\s*type:\s*(\w+)/g)
    for (const match of matches) {
      props.push({
        name: match[1],
        type: match[2],
        required: false,
      })
    }

    return props
  }

  /**
   * 提取 Events
   */
  private extractEvents(scriptContent: string, descriptor: any): EventInfo[] {
    const events: EventInfo[] = []

    // 查找 emit 调用
    const emitMatches = scriptContent.matchAll(
      /emit\s*\(\s*['"](.+?)['"]/g
    )
    for (const match of emitMatches) {
      events.push({
        name: match[1],
      })
    }

    // 查找 $emit 调用
    const $emitMatches = scriptContent.matchAll(
      /\$emit\s*\(\s*['"](.+?)['"]/g
    )
    for (const match of $emitMatches) {
      if (!events.find((e) => e.name === match[1])) {
        events.push({
          name: match[1],
        })
      }
    }

    return events
  }

  /**
   * 提取 Slots
   */
  private extractSlots(templateContent: string): SlotInfo[] {
    const slots: SlotInfo[] = []

    // 查找 <slot> 标签
    const slotMatches = templateContent.matchAll(
      /<slot(?:\s+name\s*=\s*["'](.+?)["'])?/g
    )
    for (const match of slotMatches) {
      const slotName = match[1] || 'default'
      if (!slots.find((s) => s.name === slotName)) {
        slots.push({
          name: slotName,
        })
      }
    }

    return slots
  }

  /**
   * 提取示例
   */
  private extractExamples(descriptor: any): Example[] {
    const examples: Example[] = []

    // 从自定义块提取示例
    const docsBlock = descriptor.customBlocks?.find(
      (block: any) => block.type === 'docs'
    )

    if (docsBlock) {
      // 提取示例代码块
      const exampleMatches = docsBlock.content.matchAll(
        /```(\w+)\n([\s\S]+?)```/g
      )
      for (const match of exampleMatches) {
        examples.push({
          language: match[1],
          code: match[2].trim(),
        })
      }
    }

    return examples
  }

  /**
   * 提取描述
   */
  private extractDescription(descriptor: any): string | undefined {
    // 从自定义块提取描述
    const docsBlock = descriptor.customBlocks?.find(
      (block: any) => block.type === 'docs'
    )

    if (docsBlock) {
      // 移除代码块后的内容作为描述
      return docsBlock.content.replace(/```[\s\S]+?```/g, '').trim()
    }

    return undefined
  }
}

/**
 * 创建 Vue 组件插件
 */
export function vueComponentPlugin(
  options?: VueComponentPluginOptions
): VueComponentPlugin {
  return new VueComponentPlugin(options)
}




