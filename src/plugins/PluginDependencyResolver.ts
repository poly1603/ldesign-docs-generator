/**
 * 插件依赖解析器
 * 
 * 负责解析插件依赖关系并按正确顺序加载插件
 */

import type { DocsPlugin, Logger } from '../types'

/**
 * 依赖图节点
 */
interface DependencyNode {
  plugin: DocsPlugin
  dependencies: Set<string>
  dependents: Set<string>
}

/**
 * 插件依赖解析器
 */
export class PluginDependencyResolver {
  private logger: Logger
  private plugins: Map<string, DependencyNode> = new Map()

  constructor(logger: Logger) {
    this.logger = logger
  }

  /**
   * 添加插件
   */
  addPlugin(plugin: DocsPlugin): void {
    const node: DependencyNode = {
      plugin,
      dependencies: new Set(plugin.dependencies || []),
      dependents: new Set(),
    }

    this.plugins.set(plugin.name, node)
  }

  /**
   * 解析依赖并按顺序排列插件
   * 
   * @returns 按依赖顺序排列的插件列表
   * @throws 如果发现循环依赖
   */
  resolve(): DocsPlugin[] {
    // 构建依赖图
    this.buildDependencyGraph()

    // 检查循环依赖
    this.checkCircularDependencies()

    // 拓扑排序
    return this.topologicalSort()
  }

  /**
   * 构建依赖图
   */
  private buildDependencyGraph(): void {
    for (const [name, node] of this.plugins.entries()) {
      for (const dep of node.dependencies) {
        const depNode = this.plugins.get(dep)
        if (!depNode) {
          this.logger.warn(`插件 ${name} 依赖的插件 ${dep} 未找到`)
          continue
        }
        depNode.dependents.add(name)
      }
    }
  }

  /**
   * 检查循环依赖
   */
  private checkCircularDependencies(): void {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const visit = (name: string): void => {
      if (recursionStack.has(name)) {
        const cycle = Array.from(recursionStack).concat(name).join(' -> ')
        throw new Error(`检测到循环依赖: ${cycle}`)
      }

      if (visited.has(name)) {
        return
      }

      visited.add(name)
      recursionStack.add(name)

      const node = this.plugins.get(name)!
      for (const dep of node.dependencies) {
        if (this.plugins.has(dep)) {
          visit(dep)
        }
      }

      recursionStack.delete(name)
    }

    for (const name of this.plugins.keys()) {
      if (!visited.has(name)) {
        visit(name)
      }
    }
  }

  /**
   * 拓扑排序
   * 
   * 使用 Kahn 算法
   */
  private topologicalSort(): DocsPlugin[] {
    const result: DocsPlugin[] = []
    const inDegree = new Map<string, number>()

    // 计算入度
    for (const [name, node] of this.plugins.entries()) {
      inDegree.set(name, node.dependencies.size)
    }

    // 找出所有入度为 0 的节点
    const queue: string[] = []
    for (const [name, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(name)
      }
    }

    // 拓扑排序
    while (queue.length > 0) {
      const name = queue.shift()!
      const node = this.plugins.get(name)!
      result.push(node.plugin)

      // 减少依赖该节点的节点的入度
      for (const dependent of node.dependents) {
        const degree = inDegree.get(dependent)! - 1
        inDegree.set(dependent, degree)

        if (degree === 0) {
          queue.push(dependent)
        }
      }
    }

    // 检查是否所有节点都已处理
    if (result.length !== this.plugins.size) {
      throw new Error('无法解析插件依赖关系，可能存在循环依赖')
    }

    return result
  }

  /**
   * 验证依赖
   * 
   * 检查所有依赖的插件是否存在
   */
  validateDependencies(): string[] {
    const missingDeps: string[] = []

    for (const [name, node] of this.plugins.entries()) {
      for (const dep of node.dependencies) {
        if (!this.plugins.has(dep)) {
          missingDeps.push(`${name} -> ${dep}`)
        }
      }
    }

    return missingDeps
  }

  /**
   * 获取插件依赖树（用于调试）
   */
  getDependencyTree(): Record<string, string[]> {
    const tree: Record<string, string[]> = {}

    for (const [name, node] of this.plugins.entries()) {
      tree[name] = Array.from(node.dependencies)
    }

    return tree
  }

  /**
   * 清空
   */
  clear(): void {
    this.plugins.clear()
  }
}



