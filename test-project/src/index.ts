/**
 * 测试工具库
 * 
 * 这是一个用于测试文档生成器的示例库
 */

/**
 * 计算两个数的和
 * 
 * @param a - 第一个数字
 * @param b - 第二个数字
 * @returns 两数之和
 * 
 * @example
 * ```ts
 * add(1, 2) // 返回 3
 * add(-1, 1) // 返回 0
 * ```
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * 计算两个数的差
 * 
 * @param a - 被减数
 * @param b - 减数
 * @returns 差值
 */
export function subtract(a: number, b: number): number {
  return a - b
}

/**
 * 用户信息接口
 */
export interface User {
  /** 用户 ID */
  id: number
  /** 用户名 */
  name: string
  /** 邮箱地址 */
  email: string
  /** 年龄 */
  age?: number
}

/**
 * 用户管理器类
 */
export class UserManager {
  private users: User[] = []

  /**
   * 添加用户
   * @param user - 用户信息
   */
  addUser(user: User): void {
    this.users.push(user)
  }

  /**
   * 根据 ID 查找用户
   * @param id - 用户 ID
   * @returns 用户信息，如果未找到返回 undefined
   */
  findUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id)
  }

  /**
   * 获取所有用户
   * @returns 用户列表
   */
  getAllUsers(): User[] {
    return [...this.users]
  }
}



