/**
 * React 组件解析插件
 */

import * as fs from 'fs-extra'
import * as path from 'path'
import * as doctrine from 'doctrine'
import type {
  DocsPlugin,
  ParseContext,
  ParseResult,
  ComponentDocNode,
  PropInfo,
  EventInfo,
  Example,
} from '../../types'

/**
 * React 组件插件选项
 */
export interface ReactComponentPluginOptions {
  /** 包含的文件模式 */
  include?: string | string[]
  /** 排除的文件模式 */
  exclude?: string | string[]
}

/**
 * React 组件插件
 */
export class ReactComponentPlugin implements DocsPlugin {
  name = 'react-component'
  version = '1.0.0'
  private options: ReactComponentPluginOptions

  constructor(options: ReactComponentPluginOptions = {}) {
    this.options = {
      include: options.include || '**/*.{tsx,jsx}',
      exclude: options.exclude || '**/node_modules/**',
    }
  }

  /**
   * 解析 React 组件
   */
  async parse(context: ParseContext): Promise<ParseResult> {
    const { files, sourceDir, logger } = context
    const nodes: ComponentDocNode[] = []
    const errors: Error[] = []

    // 过滤 React 文件
    const reactFiles = files.filter((file) =>
      file.endsWith('.tsx') || file.endsWith('.jsx')
    )

    logger.debug(`找到 ${reactFiles.length} 个 React 组件文件`)

    for (const file of reactFiles) {
      try {
        const fileNodes = await this.parseReactFile(file, sourceDir)
        nodes.push(...fileNodes)
      } catch (error) {
        logger.error(`解析 React 文件失败: ${file}`, error)
        errors.push(error as Error)
      }
    }

    logger.debug(`React 组件解析完成，共 ${nodes.length} 个组件`)

    return { nodes, errors: errors.length > 0 ? errors : undefined }
  }

  /**
   * 解析单个 React 文件
   */
  private async parseReactFile(
    filePath: string,
    sourceDir: string
  ): Promise<ComponentDocNode[]> {
    const nodes: ComponentDocNode[] = []

    // 读取文件内容
    const content = await fs.readFile(filePath, 'utf-8')

    // 查找组件定义
    const components = this.findComponents(content)

    for (const component of components) {
      // 提取 Props
      const props = this.extractProps(content, component)

      // 提取 Events (React 中通常是回调 props)
      const events = this.extractEvents(props)

      // 提取描述
      const description = this.extractDescription(content, component)

      // 提取示例
      const examples = this.extractExamples(content, component)

      // 创建组件文档节点
      const node: ComponentDocNode = {
        type: 'component',
        name: component.name,
        path: path.relative(sourceDir, filePath),
        outputPath: `components/${component.name}.html`,
        metadata: {
          framework: 'react',
          isFC: component.type === 'FunctionComponent',
          isClass: component.type === 'ClassComponent',
        },
        content: {
          framework: 'react',
          props,
          events,
          slots: [], // React 使用 children 和 render props
          examples,
          description,
        },
      }

      nodes.push(node)
    }

    return nodes
  }

  /**
   * 查找组件定义
   */
  private findComponents(content: string): Array<{
    name: string
    type: 'FunctionComponent' | 'ClassComponent'
    start: number
    end: number
  }> {
    const components: Array<{
      name: string
      type: 'FunctionComponent' | 'ClassComponent'
      start: number
      end: number
    }> = []

    // 函数组件
    const fcMatches = content.matchAll(
      /(?:export\s+)?(?:const|function)\s+(\w+)\s*(?::\s*React\.FC|=\s*\([^)]*\)\s*(?::|=>))/g
    )
    for (const match of fcMatches) {
      components.push({
        name: match[1],
        type: 'FunctionComponent',
        start: match.index!,
        end: match.index! + match[0].length,
      })
    }

    // 类组件
    const classMatches = content.matchAll(
      /(?:export\s+)?class\s+(\w+)\s+extends\s+(?:React\.)?(?:Component|PureComponent)/g
    )
    for (const match of classMatches) {
      components.push({
        name: match[1],
        type: 'ClassComponent',
        start: match.index!,
        end: match.index! + match[0].length,
      })
    }

    return components
  }

  /**
   * 提取 Props
   */
  private extractProps(content: string, component: {
    name: string
    type: string
  }): PropInfo[] {
    const props: PropInfo[] = []

    // 方式 1: interface 定义
    const interfaceMatch = content.match(
      new RegExp(
        `interface\\s+${component.name}Props\\s*\\{([^}]+)\\}`,
        's'
      )
    )

    if (interfaceMatch) {
      const propsContent = interfaceMatch[1]
      const propMatches = propsContent.matchAll(
        /(\w+)\s*\??\s*:\s*([^;\n]+)/g
      )

      for (const match of propMatches) {
        const propName = match[1]
        const propType = match[2].trim()
        const isOptional = match[0].includes('?')

        props.push({
          name: propName,
          type: propType,
          required: !isOptional,
        })
      }
    }

    // 方式 2: type 定义
    const typeMatch = content.match(
      new RegExp(
        `type\\s+${component.name}Props\\s*=\\s*\\{([^}]+)\\}`,
        's'
      )
    )

    if (typeMatch && props.length === 0) {
      const propsContent = typeMatch[1]
      const propMatches = propsContent.matchAll(
        /(\w+)\s*\??\s*:\s*([^;\n]+)/g
      )

      for (const match of propMatches) {
        const propName = match[1]
        const propType = match[2].trim()
        const isOptional = match[0].includes('?')

        props.push({
          name: propName,
          type: propType,
          required: !isOptional,
        })
      }
    }

    // 方式 3: PropTypes (运行时验证)
    const propTypesMatch = content.match(
      new RegExp(`${component.name}\\.propTypes\\s*=\\s*\\{([^}]+)\\}`, 's')
    )

    if (propTypesMatch && props.length === 0) {
      const propsContent = propTypesMatch[1]
      const propMatches = propsContent.matchAll(
        /(\w+)\s*:\s*PropTypes\.(\w+)(?:\.isRequired)?/g
      )

      for (const match of propMatches) {
        const propName = match[1]
        const propType = match[2]
        const isRequired = match[0].includes('.isRequired')

        props.push({
          name: propName,
          type: propType,
          required: isRequired,
        })
      }
    }

    return props
  }

  /**
   * 提取 Events (回调 props)
   */
  private extractEvents(props: PropInfo[]): EventInfo[] {
    const events: EventInfo[] = []

    // React 中事件通常是以 on 开头的回调函数
    for (const prop of props) {
      if (
        prop.name.startsWith('on') &&
        (typeof prop.type === 'string' &&
          (prop.type.includes('=>') || prop.type.includes('Function')))
      ) {
        events.push({
          name: prop.name,
          description: `回调函数: ${prop.type}`,
        })
      }
    }

    return events
  }

  /**
   * 提取描述
   */
  private extractDescription(content: string, component: {
    name: string
  }): string | undefined {
    // 查找组件前的 JSDoc 注释
    const componentIndex = content.indexOf(component.name)
    const beforeComponent = content.substring(0, componentIndex)

    // 查找最近的注释块
    const commentMatch = beforeComponent.match(/\/\*\*([\s\S]+?)\*\/\s*$/);

    if (commentMatch) {
      const comment = commentMatch[1]

      // 使用 doctrine 解析 JSDoc
      try {
        const parsed = doctrine.parse(comment, { unwrap: true })
        return parsed.description || undefined
      } catch {
        // 如果解析失败，返回原始注释
        return comment
          .split('\n')
          .map((line) => line.replace(/^\s*\*\s?/, ''))
          .join('\n')
          .trim()
      }
    }

    return undefined
  }

  /**
   * 提取示例
   */
  private extractExamples(content: string, component: {
    name: string
  }): Example[] {
    const examples: Example[] = []

    // 查找组件前的 JSDoc 注释
    const componentIndex = content.indexOf(component.name)
    const beforeComponent = content.substring(0, componentIndex)

    // 查找最近的注释块
    const commentMatch = beforeComponent.match(/\/\*\*([\s\S]+?)\*\/\s*$/)

    if (commentMatch) {
      const comment = commentMatch[1]

      // 提取 @example 标签
      try {
        const parsed = doctrine.parse(comment, { unwrap: true })

        for (const tag of parsed.tags) {
          if (tag.title === 'example' && tag.description) {
            examples.push({
              title: 'Example',
              code: tag.description,
              language: 'tsx',
            })
          }
        }
      } catch {
        // 解析失败，手动提取
        const exampleMatches = comment.matchAll(
          /@example\s*\n([\s\S]+?)(?=@|\*\/|$)/g
        )
        for (const match of exampleMatches) {
          examples.push({
            title: 'Example',
            code: match[1].trim(),
            language: 'tsx',
          })
        }
      }
    }

    return examples
  }
}

/**
 * 创建 React 组件插件
 */
export function reactComponentPlugin(
  options?: ReactComponentPluginOptions
): ReactComponentPlugin {
  return new ReactComponentPlugin(options)
}




