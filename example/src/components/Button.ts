/**
 * Button 组件
 * 
 * @packageDocumentation
 */

/**
 * 按钮类型
 * 
 * @public
 */
export type ButtonType = 'default' | 'primary' | 'success' | 'warning' | 'danger'

/**
 * 按钮尺寸
 * 
 * @public
 */
export type ButtonSize = 'small' | 'medium' | 'large'

/**
 * 按钮属性
 * 
 * @public
 */
export interface ButtonProps {
  /**
   * 按钮类型
   * @default 'default'
   */
  type?: ButtonType
  
  /**
   * 按钮尺寸
   * @default 'medium'
   */
  size?: ButtonSize
  
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  
  /**
   * 是否加载中
   * @default false
   */
  loading?: boolean
  
  /**
   * 图标名称
   */
  icon?: string
  
  /**
   * 是否圆角
   * @default false
   */
  round?: boolean
  
  /**
   * 是否圆形
   * @default false
   */
  circle?: boolean
  
  /**
   * 按钮文本
   */
  text?: string
  
  /**
   * 点击事件处理器
   */
  onClick?: (event: MouseEvent) => void
}

/**
 * Button 组件类
 * 
 * 提供多种样式和功能的按钮组件。
 * 
 * @example
 * 基础用法：
 * ```typescript
 * const button = new Button({
 *   type: 'primary',
 *   text: 'Click me'
 * })
 * 
 * button.mount('#app')
 * ```
 * 
 * @example
 * 带图标的按钮：
 * ```typescript
 * const button = new Button({
 *   type: 'primary',
 *   icon: 'search',
 *   text: 'Search'
 * })
 * ```
 * 
 * @example
 * 加载状态：
 * ```typescript
 * const button = new Button({
 *   text: 'Submit',
 *   onClick: async () => {
 *     button.setLoading(true)
 *     await submitForm()
 *     button.setLoading(false)
 *   }
 * })
 * ```
 * 
 * @public
 */
export class Button {
  private props: Required<ButtonProps>
  private element: HTMLButtonElement | null = null
  
  /**
   * 创建一个按钮实例
   * 
   * @param props - 按钮属性
   */
  constructor(props: ButtonProps = {}) {
    this.props = {
      type: props.type || 'default',
      size: props.size || 'medium',
      disabled: props.disabled || false,
      loading: props.loading || false,
      icon: props.icon || '',
      round: props.round || false,
      circle: props.circle || false,
      text: props.text || '',
      onClick: props.onClick || (() => {}),
    }
  }
  
  /**
   * 挂载按钮到 DOM
   * 
   * @param selector - CSS 选择器或 DOM 元素
   * 
   * @example
   * ```typescript
   * button.mount('#app')
   * // 或
   * button.mount(document.getElementById('app'))
   * ```
   */
  mount(selector: string | HTMLElement): void {
    const container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector
    
    if (!container) {
      throw new Error(`Element not found: ${selector}`)
    }
    
    this.element = this.render()
    container.appendChild(this.element)
  }
  
  /**
   * 卸载按钮
   * 
   * @example
   * ```typescript
   * button.unmount()
   * ```
   */
  unmount(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    this.element = null
  }
  
  /**
   * 设置加载状态
   * 
   * @param loading - 是否加载中
   * 
   * @example
   * ```typescript
   * button.setLoading(true)
   * setTimeout(() => button.setLoading(false), 2000)
   * ```
   */
  setLoading(loading: boolean): void {
    this.props.loading = loading
    this.update()
  }
  
  /**
   * 设置禁用状态
   * 
   * @param disabled - 是否禁用
   * 
   * @example
   * ```typescript
   * button.setDisabled(true)
   * ```
   */
  setDisabled(disabled: boolean): void {
    this.props.disabled = disabled
    this.update()
  }
  
  /**
   * 设置按钮文本
   * 
   * @param text - 按钮文本
   * 
   * @example
   * ```typescript
   * button.setText('New Text')
   * ```
   */
  setText(text: string): void {
    this.props.text = text
    this.update()
  }
  
  /**
   * 获取按钮类型
   * 
   * @returns 按钮类型
   */
  getType(): ButtonType {
    return this.props.type
  }
  
  /**
   * 获取按钮尺寸
   * 
   * @returns 按钮尺寸
   */
  getSize(): ButtonSize {
    return this.props.size
  }
  
  /**
   * 渲染按钮元素
   * 
   * @internal
   */
  private render(): HTMLButtonElement {
    const button = document.createElement('button')
    button.className = this.getClassName()
    button.disabled = this.props.disabled || this.props.loading
    button.textContent = this.props.loading ? '加载中...' : this.props.text
    
    button.addEventListener('click', (event) => {
      if (!this.props.disabled && !this.props.loading) {
        this.props.onClick(event)
      }
    })
    
    return button
  }
  
  /**
   * 更新按钮
   * 
   * @internal
   */
  private update(): void {
    if (!this.element) return
    
    this.element.className = this.getClassName()
    this.element.disabled = this.props.disabled || this.props.loading
    this.element.textContent = this.props.loading ? '加载中...' : this.props.text
  }
  
  /**
   * 获取 CSS 类名
   * 
   * @internal
   */
  private getClassName(): string {
    const classes = [
      'ld-button',
      `ld-button--${this.props.type}`,
      `ld-button--${this.props.size}`,
    ]
    
    if (this.props.round) {
      classes.push('ld-button--round')
    }
    
    if (this.props.circle) {
      classes.push('ld-button--circle')
    }
    
    if (this.props.loading) {
      classes.push('is-loading')
    }
    
    if (this.props.disabled) {
      classes.push('is-disabled')
    }
    
    return classes.join(' ')
  }
}

/**
 * 创建一个按钮实例
 * 
 * 这是创建按钮的快捷方法。
 * 
 * @param props - 按钮属性
 * @returns Button 实例
 * 
 * @example
 * ```typescript
 * const button = createButton({
 *   type: 'primary',
 *   text: 'Click me',
 *   onClick: () => console.log('Clicked!')
 * })
 * 
 * button.mount('#app')
 * ```
 * 
 * @public
 */
export function createButton(props: ButtonProps = {}): Button {
  return new Button(props)
}

// 导出类型
export type {
  ButtonProps,
  ButtonType,
  ButtonSize,
}
