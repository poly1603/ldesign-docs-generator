/**
 * 全局组件注册
 * 自动注册 VitePress 主题的所有组件
 */

import type { App } from 'vue'
import { defineAsyncComponent } from 'vue'

/**
 * 注册全局组件
 */
export function setupGlobalComponents(app: App): void {
  // 主题组件
  const themeComponents = import.meta.glob(
    '../../templates/vitepress-default/components/*.vue',
    { eager: false }
  )

  for (const path in themeComponents) {
    const componentName = path.split('/').pop()!.replace('.vue', '')
    app.component(componentName, defineAsyncComponent(themeComponents[path] as any))
  }

  // 布局组件（以 Layout 前缀暴露）
  const layoutComponents = import.meta.glob(
    '../../templates/vitepress-default/layouts/*.vue',
    { eager: false }
  )

  for (const path in layoutComponents) {
    const componentName = 'Layout' + path.split('/').pop()!.replace('.vue', '')
    app.component(componentName, defineAsyncComponent(layoutComponents[path] as any))
  }

  // 其他全局组件可以在此处继续注册
  console.log('[ldesign-docs] Global components registered')
}
