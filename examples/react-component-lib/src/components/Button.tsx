/**
 * Button 按钮组件
 * 
 * 基础按钮组件，支持多种类型和尺寸
 * 
 * @example
 * ```tsx
 * <Button type="primary" size="medium" onClick={handleClick}>
 *   点击我
 * </Button>
 * ```
 */

import React from 'react'

export interface ButtonProps {
  /** 按钮类型 */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 点击事件 */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** 子元素 */
  children?: React.ReactNode
}

/**
 * Button 组件
 */
export const Button: React.FC<ButtonProps> = ({
  type = 'default',
  size = 'medium',
  disabled = false,
  onClick,
  children,
}) => {
  const className = ['btn', `btn-${type}`, `btn-${size}`, disabled && 'btn-disabled']
    .filter(Boolean)
    .join(' ')

  return (
    <button className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}

Button.displayName = 'Button'



