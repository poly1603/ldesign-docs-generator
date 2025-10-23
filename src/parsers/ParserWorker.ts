/**
 * 解析器 Worker
 * 
 * 使用 worker_threads 进行多进程解析
 */

import { Worker } from 'worker_threads'
import * as path from 'path'
import type { Logger, ParseContext, ParseResult, DocsPlugin } from '../types'

/**
 * Worker 任务
 */
interface WorkerTask {
  id: string
  plugin: DocsPlugin
  context: ParseContext
  resolve: (result: ParseResult) => void
  reject: (error: Error) => void
}

/**
 * Worker 消息
 */
interface WorkerMessage {
  type: 'parse' | 'result' | 'error'
  taskId?: string
  plugin?: DocsPlugin
  context?: ParseContext
  result?: ParseResult
  error?: string
}

/**
 * Parser Worker Pool
 */
export class ParserWorkerPool {
  private logger: Logger
  private workers: Worker[] = []
  private availableWorkers: Worker[] = []
  private taskQueue: WorkerTask[] = []
  private activeTasks = new Map<string, WorkerTask>()
  private workerCount: number
  private workerPath: string

  constructor(logger: Logger, workerCount: number = 4) {
    this.logger = logger
    this.workerCount = workerCount
    this.workerPath = path.join(__dirname, 'parser-worker-impl.js')
  }

  /**
   * 初始化 Worker Pool
   */
  async init(): Promise<void> {
    this.logger.debug(`初始化 Parser Worker Pool，Worker 数量: ${this.workerCount}`)

    for (let i = 0; i < this.workerCount; i++) {
      try {
        const worker = await this.createWorker()
        this.workers.push(worker)
        this.availableWorkers.push(worker)
      } catch (error) {
        this.logger.error(`创建 Worker ${i} 失败:`, error)
      }
    }

    this.logger.info(`Parser Worker Pool 已初始化，${this.workers.length} 个 Worker`)
  }

  /**
   * 创建 Worker
   */
  private async createWorker(): Promise<Worker> {
    // 注意：由于我们在TypeScript环境中，这里简化实现
    // 实际使用时需要编译后的JS文件路径
    const worker = new Worker(
      `
      const { parentPort } = require('worker_threads');
      
      parentPort.on('message', async (message) => {
        if (message.type === 'parse') {
          try {
            const { taskId, plugin, context } = message;
            
            // 执行解析
            let result = { nodes: [], errors: [], warnings: [] };
            if (plugin.parse) {
              result = await plugin.parse(context);
            }
            
            parentPort.postMessage({
              type: 'result',
              taskId,
              result
            });
          } catch (error) {
            parentPort.postMessage({
              type: 'error',
              taskId: message.taskId,
              error: error.message
            });
          }
        }
      });
      `,
      { eval: true }
    )

    worker.on('message', (message: WorkerMessage) => {
      this.handleWorkerMessage(worker, message)
    })

    worker.on('error', (error) => {
      this.logger.error('Worker 错误:', error)
    })

    worker.on('exit', (code) => {
      if (code !== 0) {
        this.logger.warn(`Worker 异常退出，代码: ${code}`)
        // 移除失败的 Worker
        const index = this.workers.indexOf(worker)
        if (index > -1) {
          this.workers.splice(index, 1)
        }
        const availIndex = this.availableWorkers.indexOf(worker)
        if (availIndex > -1) {
          this.availableWorkers.splice(availIndex, 1)
        }
      }
    })

    return worker
  }

  /**
   * 处理 Worker 消息
   */
  private handleWorkerMessage(worker: Worker, message: WorkerMessage): void {
    if (!message.taskId) return

    const task = this.activeTasks.get(message.taskId)
    if (!task) return

    if (message.type === 'result' && message.result) {
      task.resolve(message.result)
      this.completeTask(message.taskId, worker)
    } else if (message.type === 'error' && message.error) {
      task.reject(new Error(message.error))
      this.completeTask(message.taskId, worker)
    }
  }

  /**
   * 完成任务
   */
  private completeTask(taskId: string, worker: Worker): void {
    this.activeTasks.delete(taskId)
    this.availableWorkers.push(worker)
    this.processQueue()
  }

  /**
   * 提交解析任务
   */
  async parse(plugin: DocsPlugin, context: ParseContext): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const task: WorkerTask = {
        id: taskId,
        plugin,
        context,
        resolve,
        reject,
      }

      this.taskQueue.push(task)
      this.processQueue()
    })
  }

  /**
   * 处理任务队列
   */
  private processQueue(): void {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift()!
      const worker = this.availableWorkers.shift()!

      this.activeTasks.set(task.id, task)

      const message: WorkerMessage = {
        type: 'parse',
        taskId: task.id,
        plugin: task.plugin,
        context: task.context,
      }

      worker.postMessage(message)
    }
  }

  /**
   * 销毁 Worker Pool
   */
  async destroy(): Promise<void> {
    this.logger.debug('销毁 Parser Worker Pool')

    for (const worker of this.workers) {
      await worker.terminate()
    }

    this.workers = []
    this.availableWorkers = []
    this.taskQueue = []
    this.activeTasks.clear()

    this.logger.info('Parser Worker Pool 已销毁')
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalWorkers: number
    availableWorkers: number
    activeTasks: number
    queuedTasks: number
  } {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length,
    }
  }
}

/**
 * 简化的并行解析器（不使用 Worker）
 * 
 * 作为 fallback 当 Worker 不可用时
 */
export class SimpleParallelParser {
  private logger: Logger
  private concurrency: number

  constructor(logger: Logger, concurrency: number = 4) {
    this.logger = logger
    this.concurrency = concurrency
  }

  /**
   * 并行解析多个插件
   */
  async parseAll(
    plugins: DocsPlugin[],
    context: ParseContext
  ): Promise<ParseResult[]> {
    const results: ParseResult[] = []

    // 分批并行处理
    for (let i = 0; i < plugins.length; i += this.concurrency) {
      const batch = plugins.slice(i, i + this.concurrency)
      const batchResults = await Promise.all(
        batch.map(async (plugin) => {
          if (!plugin.parse) {
            return { nodes: [] }
          }

          try {
            return await plugin.parse(context)
          } catch (error) {
            this.logger.error(`插件 ${plugin.name} 解析失败:`, error)
            return {
              nodes: [],
              errors: [error as Error],
            }
          }
        })
      )

      results.push(...batchResults)
    }

    return results
  }
}



