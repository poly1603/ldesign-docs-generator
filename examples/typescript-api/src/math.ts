/**
 * 数学工具函数
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
 * 减法运算
 * 
 * @param a - 被减数
 * @param b - 减数
 * @returns 差
 * 
 * @example
 * ```ts
 * const diff = subtract(5, 3)
 * console.log(diff) // 2
 * ```
 */
export function subtract(a: number, b: number): number {
  return a - b
}

/**
 * 乘法运算
 * 
 * @param a - 第一个乘数
 * @param b - 第二个乘数
 * @returns 积
 */
export function multiply(a: number, b: number): number {
  return a * b
}

/**
 * 除法运算
 * 
 * @param a - 被除数
 * @param b - 除数
 * @returns 商
 * @throws 当除数为 0 时抛出错误
 * 
 * @example
 * ```ts
 * const quotient = divide(10, 2)
 * console.log(quotient) // 5
 * ```
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('除数不能为 0')
  }
  return a / b
}

/**
 * 计算器类
 * 
 * 提供链式调用的数学运算
 * 
 * @example
 * ```ts
 * const calc = new Calculator(10)
 *   .add(5)
 *   .multiply(2)
 *   .subtract(10)
 * 
 * console.log(calc.value) // 20
 * ```
 */
export class Calculator {
  /** 当前值 */
  private _value: number

  /**
   * 构造函数
   * 
   * @param initialValue - 初始值
   */
  constructor(initialValue: number = 0) {
    this._value = initialValue
  }

  /**
   * 获取当前值
   */
  get value(): number {
    return this._value
  }

  /**
   * 加法
   */
  add(n: number): this {
    this._value += n
    return this
  }

  /**
   * 减法
   */
  subtract(n: number): this {
    this._value -= n
    return this
  }

  /**
   * 乘法
   */
  multiply(n: number): this {
    this._value *= n
    return this
  }

  /**
   * 除法
   */
  divide(n: number): this {
    if (n === 0) {
      throw new Error('除数不能为 0')
    }
    this._value /= n
    return this
  }

  /**
   * 重置
   */
  reset(): this {
    this._value = 0
    return this
  }
}



