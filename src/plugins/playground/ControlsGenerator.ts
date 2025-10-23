/**
 * 控件生成器
 * 
 * 根据组件 Props 自动生成参数调节控件
 */

import type { PropInfo } from '../../types'

/**
 * 控件类型
 */
export type ControlType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'range'
  | 'date'
  | 'textarea'

/**
 * 控件配置
 */
export interface ControlConfig {
  type: ControlType
  label: string
  defaultValue: any
  options?: Array<{ label: string; value: any }>
  min?: number
  max?: number
  step?: number
}

/**
 * 控件生成器
 */
export class ControlsGenerator {
  /**
   * 从 Props 生成控件配置
   */
  generateControls(props: PropInfo[]): ControlConfig[] {
    return props.map(prop => this.propToControl(prop))
  }

  /**
   * 将 Prop 转换为控件配置
   */
  private propToControl(prop: PropInfo): ControlConfig {
    const type = this.inferControlType(prop)

    return {
      type,
      label: prop.name,
      defaultValue: prop.defaultValue,
      options: this.extractOptions(prop),
      ...this.extractNumericConstraints(prop),
    }
  }

  /**
   * 推断控件类型
   */
  private inferControlType(prop: PropInfo): ControlType {
    const typeStr = typeof prop.type === 'string' ? prop.type : prop.type.name

    // 布尔类型
    if (typeStr === 'boolean' || typeStr === 'Boolean') {
      return 'boolean'
    }

    // 数字类型
    if (typeStr === 'number' || typeStr === 'Number') {
      return 'number'
    }

    // 颜色类型
    if (prop.name.toLowerCase().includes('color') ||
      prop.name.toLowerCase().includes('colour')) {
      return 'color'
    }

    // 日期类型
    if (typeStr === 'Date' || prop.name.toLowerCase().includes('date')) {
      return 'date'
    }

    // 枚举类型（联合类型）
    if (typeStr.includes('|')) {
      return 'select'
    }

    // 长文本
    if (prop.name.toLowerCase().includes('description') ||
      prop.name.toLowerCase().includes('content')) {
      return 'textarea'
    }

    // 默认为文本
    return 'text'
  }

  /**
   * 提取选项（用于 select）
   */
  private extractOptions(prop: PropInfo): Array<{ label: string; value: any }> | undefined {
    const typeStr = typeof prop.type === 'string' ? prop.type : prop.type.name

    // 解析联合类型
    if (typeStr.includes('|')) {
      const values = typeStr.split('|').map(v => v.trim().replace(/['"]/g, ''))
      return values.map(v => ({ label: v, value: v }))
    }

    return undefined
  }

  /**
   * 提取数字约束（用于 number 和 range）
   */
  private extractNumericConstraints(prop: PropInfo): {
    min?: number
    max?: number
    step?: number
  } {
    // 从 validator 或注释中提取约束
    // 这里简化处理
    return {}
  }

  /**
   * 生成控件 HTML
   */
  generateControlHTML(control: ControlConfig, propName: string): string {
    switch (control.type) {
      case 'boolean':
        return this.generateCheckbox(control, propName)
      case 'number':
        return this.generateNumberInput(control, propName)
      case 'select':
        return this.generateSelect(control, propName)
      case 'color':
        return this.generateColorPicker(control, propName)
      case 'range':
        return this.generateRange(control, propName)
      case 'date':
        return this.generateDatePicker(control, propName)
      case 'textarea':
        return this.generateTextarea(control, propName)
      case 'text':
      default:
        return this.generateTextInput(control, propName)
    }
  }

  /**
   * 生成复选框
   */
  private generateCheckbox(control: ControlConfig, propName: string): string {
    const checked = control.defaultValue ? 'checked' : ''
    return `
      <div class="control-group">
        <label>
          <input
            type="checkbox"
            name="${propName}"
            ${checked}
            onchange="updateProp('${propName}', this.checked)"
          >
          <span>${control.label}</span>
        </label>
      </div>
    `
  }

  /**
   * 生成数字输入
   */
  private generateNumberInput(control: ControlConfig, propName: string): string {
    const { min = '', max = '', step = '' } = control
    return `
      <div class="control-group">
        <label for="${propName}">${control.label}</label>
        <input
          type="number"
          id="${propName}"
          name="${propName}"
          value="${control.defaultValue || 0}"
          min="${min}"
          max="${max}"
          step="${step}"
          oninput="updateProp('${propName}', parseFloat(this.value))"
        >
      </div>
    `
  }

  /**
   * 生成下拉选择
   */
  private generateSelect(control: ControlConfig, propName: string): string {
    const options = control.options || []
    const optionsHTML = options
      .map(opt => {
        const selected = opt.value === control.defaultValue ? 'selected' : ''
        return `<option value="${opt.value}" ${selected}>${opt.label}</option>`
      })
      .join('\n')

    return `
      <div class="control-group">
        <label for="${propName}">${control.label}</label>
        <select
          id="${propName}"
          name="${propName}"
          onchange="updateProp('${propName}', this.value)"
        >
          ${optionsHTML}
        </select>
      </div>
    `
  }

  /**
   * 生成颜色选择器
   */
  private generateColorPicker(control: ControlConfig, propName: string): string {
    return `
      <div class="control-group">
        <label for="${propName}">${control.label}</label>
        <input
          type="color"
          id="${propName}"
          name="${propName}"
          value="${control.defaultValue || '#000000'}"
          oninput="updateProp('${propName}', this.value)"
        >
      </div>
    `
  }

  /**
   * 生成滑块
   */
  private generateRange(control: ControlConfig, propName: string): string {
    const { min = 0, max = 100, step = 1 } = control
    return `
      <div class="control-group">
        <label for="${propName}">${control.label}</label>
        <input
          type="range"
          id="${propName}"
          name="${propName}"
          value="${control.defaultValue || min}"
          min="${min}"
          max="${max}"
          step="${step}"
          oninput="updateProp('${propName}', parseFloat(this.value)); this.nextElementSibling.textContent = this.value"
        >
        <span class="range-value">${control.defaultValue || min}</span>
      </div>
    `
  }

  /**
   * 生成日期选择器
   */
  private generateDatePicker(control: ControlConfig, propName: string): string {
    return `
      <div class="control-group">
        <label for="${propName}">${control.label}</label>
        <input
          type="date"
          id="${propName}"
          name="${propName}"
          value="${control.defaultValue || ''}"
          onchange="updateProp('${propName}', this.value)"
        >
      </div>
    `
  }

  /**
   * 生成文本域
   */
  private generateTextarea(control: ControlConfig, propName: string): string {
    return `
      <div class="control-group">
        <label for="${propName}">${control.label}</label>
        <textarea
          id="${propName}"
          name="${propName}"
          rows="4"
          oninput="updateProp('${propName}', this.value)"
        >${control.defaultValue || ''}</textarea>
      </div>
    `
  }

  /**
   * 生成文本输入
   */
  private generateTextInput(control: ControlConfig, propName: string): string {
    return `
      <div class="control-group">
        <label for="${propName}">${control.label}</label>
        <input
          type="text"
          id="${propName}"
          name="${propName}"
          value="${control.defaultValue || ''}"
          oninput="updateProp('${propName}', this.value)"
        >
      </div>
    `
  }
}



