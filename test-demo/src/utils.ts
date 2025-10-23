/**
 * 工具函数
 * 
 * @packageDocumentation
 */

/**
 * 加法运算
 * 
 * @param a - 第一个数
 * @param b - 第二个数
 * @returns 两数之和
 * 
 * @example
 * ```ts
 * const sum = add(1, 2)
 * console.log(sum) // 3
 * ```
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * 格式化日期
 * 
 * @param date - 日期对象
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

