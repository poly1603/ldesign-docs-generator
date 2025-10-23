/**
 * 工具函数
 */

/**
 * 格式化日期
 * 
 * @param date - 日期对象或时间戳
 * @param format - 格式字符串
 * @returns 格式化后的日期字符串
 * 
 * @example
 * ```ts
 * formatDate(new Date(), 'YYYY-MM-DD')
 * // => '2025-10-23'
 * ```
 */
export function formatDate(date: Date | number, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'number' ? new Date(date) : date

  return format
    .replace('YYYY', d.getFullYear().toString())
    .replace('MM', (d.getMonth() + 1).toString().padStart(2, '0'))
    .replace('DD', d.getDate().toString().padStart(2, '0'))
}

/**
 * 防抖函数
 * 
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 * 
 * @example
 * ```ts
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching:', query)
 * }, 300)
 * 
 * debouncedSearch('hello')
 * debouncedSearch('world') // 只会执行这一次
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * 节流函数
 * 
 * @param fn - 要节流的函数
 * @param interval - 时间间隔（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastTime >= interval) {
      lastTime = now
      fn(...args)
    }
  }
}



