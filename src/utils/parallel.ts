/**
 * 并行处理工具
 */

/**
 * 并行处理多个任务
 */
export async function processInParallel<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: {
    concurrency?: number
    onProgress?: (completed: number, total: number) => void
  } = {}
): Promise<R[]> {
  const concurrency = options.concurrency || 4
  const results: R[] = new Array(items.length)
  const queue = items.map((item, index) => ({ item, index }))
  let completed = 0

  const workers = Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(async () => {
      while (queue.length > 0) {
        const task = queue.shift()
        if (!task) break

        const result = await processor(task.item, task.index)
        results[task.index] = result

        completed++
        if (options.onProgress) {
          options.onProgress(completed, items.length)
        }
      }
    })

  await Promise.all(workers)
  return results
}

/**
 * 批量处理（分批并行）
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await processor(batch)
    results.push(...batchResults)
  }

  return results
}

/**
 * 带重试的异步执行
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    onRetry?: (error: Error, attempt: number) => void
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries || 3
  const delay = options.delay || 1000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }

      if (options.onRetry) {
        options.onRetry(error as Error, attempt)
      }

      await sleep(delay * attempt)
    }
  }

  throw new Error('Should not reach here')
}

/**
 * 睡眠
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 限流（节流）
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  let lastCall = 0

  return ((...args: any[]) => {
    const now = Date.now()
    if (now - lastCall < delay) {
      return
    }
    lastCall = now
    return fn(...args)
  }) as T
}

/**
 * 防抖
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null

  return ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }) as T
}

/**
 * 异步队列
 */
export class AsyncQueue<T> {
  private queue: T[] = []
  private processing = false
  private processor: (item: T) => Promise<void>

  constructor(processor: (item: T) => Promise<void>) {
    this.processor = processor
  }

  /**
   * 添加到队列
   */
  enqueue(item: T): void {
    this.queue.push(item)
    this.process()
  }

  /**
   * 处理队列
   */
  private async process(): Promise<void> {
    if (this.processing) return

    this.processing = true

    while (this.queue.length > 0) {
      const item = this.queue.shift()!
      try {
        await this.processor(item)
      } catch (error) {
        console.error('Queue processing error:', error)
      }
    }

    this.processing = false
  }

  /**
   * 获取队列长度
   */
  get length(): number {
    return this.queue.length
  }

  /**
   * 是否正在处理
   */
  get isProcessing(): boolean {
    return this.processing
  }
}




