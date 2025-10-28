/**
 * LDesign Example Package
 * 
 * 这是一个示例包，用于演示 @ldesign/docs-generator 如何自动生成 API 文档。
 * 
 * @packageDocumentation
 */

/**
 * 配置选项
 * 
 * @public
 */
export interface InstanceOptions {
  /**
   * 应用名称
   * @default 'my-app'
   */
  name?: string
  
  /**
   * 版本号
   * @default '1.0.0'
   */
  version?: string
  
  /**
   * 是否启用调试模式
   * @default false
   */
  debug?: boolean
  
  /**
   * 插件列表
   * @default []
   */
  plugins?: Plugin[]
}

/**
 * 实例对象
 * 
 * @public
 */
export interface Instance {
  /**
   * 应用名称
   */
  readonly name: string
  
  /**
   * 版本号
   */
  readonly version: string
  
  /**
   * 启动应用
   * 
   * @returns Promise
   * 
   * @example
   * ```typescript
   * const app = createInstance({ name: 'my-app' })
   * await app.start()
   * ```
   */
  start(): Promise<void>
  
  /**
   * 停止应用
   * 
   * @returns Promise
   * 
   * @example
   * ```typescript
   * await app.stop()
   * ```
   */
  stop(): Promise<void>
  
  /**
   * 使用插件
   * 
   * @param plugin - 插件对象
   * 
   * @example
   * ```typescript
   * app.use(myPlugin)
   * ```
   */
  use(plugin: Plugin): void
}

/**
 * 插件对象
 * 
 * @public
 */
export interface Plugin {
  /**
   * 插件名称
   */
  name: string
  
  /**
   * 插件版本
   */
  version?: string
  
  /**
   * 安装插件
   * 
   * @param instance - 实例对象
   */
  install(instance: Instance): void
}

/**
 * 创建一个新的实例
 * 
 * 这是创建应用实例的主要入口函数。
 * 
 * @param options - 配置选项
 * @returns 实例对象
 * 
 * @example
 * 基础用法：
 * ```typescript
 * const app = createInstance({
 *   name: 'my-app',
 *   version: '1.0.0'
 * })
 * 
 * await app.start()
 * ```
 * 
 * @example
 * 使用插件：
 * ```typescript
 * const app = createInstance({
 *   name: 'my-app',
 *   plugins: [myPlugin]
 * })
 * 
 * // 或动态安装
 * app.use(anotherPlugin)
 * ```
 * 
 * @public
 */
export function createInstance(options: InstanceOptions = {}): Instance {
  const {
    name = 'my-app',
    version = '1.0.0',
    debug = false,
    plugins = [],
  } = options
  
  const installedPlugins = new Set<Plugin>()
  
  const instance: Instance = {
    name,
    version,
    
    async start() {
      if (debug) {
        console.log(`Starting ${name} v${version}`)
      }
      
      // 初始化插件
      for (const plugin of installedPlugins) {
        if (debug) {
          console.log(`Initializing plugin: ${plugin.name}`)
        }
      }
    },
    
    async stop() {
      if (debug) {
        console.log(`Stopping ${name}`)
      }
    },
    
    use(plugin: Plugin) {
      if (installedPlugins.has(plugin)) {
        console.warn(`Plugin ${plugin.name} is already installed`)
        return
      }
      
      installedPlugins.add(plugin)
      plugin.install(instance)
    },
  }
  
  // 安装初始插件
  for (const plugin of plugins) {
    instance.use(plugin)
  }
  
  return instance
}

/**
 * 格式化日期
 * 
 * @param date - 日期对象或时间戳
 * @param format - 格式字符串
 * @returns 格式化后的日期字符串
 * 
 * @example
 * ```typescript
 * formatDate(new Date(), 'YYYY-MM-DD')
 * // => '2025-10-28'
 * 
 * formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss')
 * // => '2025-10-28 15:30:00'
 * ```
 * 
 * @public
 */
export function formatDate(date: Date | number, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'number' ? new Date(date) : date
  
  const tokens: Record<string, number> = {
    'YYYY': d.getFullYear(),
    'MM': d.getMonth() + 1,
    'DD': d.getDate(),
    'HH': d.getHours(),
    'mm': d.getMinutes(),
    'ss': d.getSeconds(),
  }
  
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => {
    const value = tokens[match]
    return String(value).padStart(2, '0')
  })
}

/**
 * 延迟执行
 * 
 * @param ms - 延迟时间（毫秒）
 * @returns Promise
 * 
 * @example
 * ```typescript
 * console.log('Start')
 * await delay(1000)
 * console.log('1 second later')
 * ```
 * 
 * @public
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 深度克隆对象
 * 
 * @param obj - 要克隆的对象
 * @returns 克隆后的对象
 * 
 * @example
 * ```typescript
 * const obj = { a: 1, b: { c: 2 } }
 * const cloned = deepClone(obj)
 * 
 * cloned.b.c = 3
 * console.log(obj.b.c) // => 2
 * ```
 * 
 * @public
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any
  }
  
  if (obj instanceof Object) {
    const cloned: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

/**
 * 防抖函数
 * 
 * 在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时。
 * 
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 * 
 * @example
 * ```typescript
 * const handleInput = debounce((value: string) => {
 *   console.log('Input:', value)
 * }, 300)
 * 
 * input.addEventListener('input', (e) => {
 *   handleInput(e.target.value)
 * })
 * ```
 * 
 * @public
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * 
 * 规定在一个单位时间内，只能触发一次函数。
 * 
 * @param fn - 要节流的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 节流后的函数
 * 
 * @example
 * ```typescript
 * const handleScroll = throttle(() => {
 *   console.log('Scrolled')
 * }, 200)
 * 
 * window.addEventListener('scroll', handleScroll)
 * ```
 * 
 * @public
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

// 导出类型
export type {
  InstanceOptions,
  Instance,
  Plugin,
}
