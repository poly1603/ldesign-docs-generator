/**
 * Markdown 容器插件
 * 提供 tip, warning, danger, details, info 等容器
 */

import type MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'

/**
 * 容器类型
 */
export type ContainerType = 'tip' | 'warning' | 'danger' | 'details' | 'info'

/**
 * 容器配置
 */
export interface ContainerConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 自定义标题 */
  title?: string
  /** 自定义类名 */
  className?: string
}

/**
 * 所有容器配置
 */
export interface ContainersConfig {
  tip?: ContainerConfig
  warning?: ContainerConfig
  danger?: ContainerConfig
  details?: ContainerConfig
  info?: ContainerConfig
  /** 自定义容器 */
  custom?: Record<string, ContainerConfig>
}

/**
 * 容器默认配置
 */
const defaultContainers: Record<ContainerType, { title: string; icon: string; className: string }> = {
  tip: {
    title: '提示',
    icon: '💡',
    className: 'tip',
  },
  warning: {
    title: '注意',
    icon: '⚠️',
    className: 'warning',
  },
  danger: {
    title: '警告',
    icon: '🚨',
    className: 'danger',
  },
  details: {
    title: '详细信息',
    icon: '📋',
    className: 'details',
  },
  info: {
    title: '信息',
    icon: 'ℹ️',
    className: 'info',
  },
}

/**
 * 应用容器插件
 */
export function applyContainers(md: MarkdownIt, config: ContainersConfig = {}): void {
  // 应用内置容器
  ; (Object.keys(defaultContainers) as ContainerType[]).forEach((type) => {
    const containerConfig = config[type]
    if (containerConfig?.enabled === false) {
      return
    }

    const defaults = defaultContainers[type]

    md.use(container, type, {
      render(tokens: any[], idx: number): string {
        const token = tokens[idx]

        if (token.nesting === 1) {
          // 开始标签
          const title = containerConfig?.title || token.info.trim().slice(type.length).trim() || defaults.title
          const className = containerConfig?.className || defaults.className

          return `<div class="custom-container ${className}">
  <p class="custom-container-title">${defaults.icon} ${escapeHtml(title)}</p>\n`
        } else {
          // 结束标签
          return '</div>\n'
        }
      },
    })
  })

  // 应用自定义容器
  if (config.custom) {
    Object.entries(config.custom).forEach(([name, containerConfig]) => {
      if (containerConfig.enabled === false) {
        return
      }

      md.use(container, name, {
        render(tokens: any[], idx: number): string {
          const token = tokens[idx]

          if (token.nesting === 1) {
            const title = containerConfig.title || token.info.trim().slice(name.length).trim() || name
            const className = containerConfig.className || name

            return `<div class="custom-container ${className}">
  <p class="custom-container-title">${escapeHtml(title)}</p>\n`
          } else {
            return '</div>\n'
          }
        },
      })
    })
  }
}

/**
 * HTML 转义
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 容器样式（可注入到页面中）
 */
export const containerStyles = `
.custom-container {
  margin: 1.5em 0;
  padding: 1.25rem 1.5rem;
  border-left: 4px solid;
  border-radius: 4px;
  background-color: #f8f8f8;
}

.custom-container-title {
  font-weight: 600;
  margin: 0 0 0.75em 0;
  font-size: 1.05em;
}

/* Tip 容器 */
.custom-container.tip {
  border-color: #42b983;
  background-color: #f0f9ff;
}

.custom-container.tip .custom-container-title {
  color: #059669;
}

/* Warning 容器 */
.custom-container.warning {
  border-color: #f59e0b;
  background-color: #fffbeb;
}

.custom-container.warning .custom-container-title {
  color: #d97706;
}

/* Danger 容器 */
.custom-container.danger {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.custom-container.danger .custom-container-title {
  color: #dc2626;
}

/* Details 容器 */
.custom-container.details {
  border-color: #6366f1;
  background-color: #eef2ff;
}

.custom-container.details .custom-container-title {
  color: #4f46e5;
}

/* Info 容器 */
.custom-container.info {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.custom-container.info .custom-container-title {
  color: #2563eb;
}

.custom-container p:last-child {
  margin-bottom: 0;
}

.custom-container code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

/* 暗黑模式 */
@media (prefers-color-scheme: dark) {
  .custom-container {
    background-color: #1e1e1e;
  }

  .custom-container.tip {
    background-color: rgba(16, 185, 129, 0.1);
  }

  .custom-container.warning {
    background-color: rgba(245, 158, 11, 0.1);
  }

  .custom-container.danger {
    background-color: rgba(239, 68, 68, 0.1);
  }

  .custom-container.details {
    background-color: rgba(99, 102, 241, 0.1);
  }

  .custom-container.info {
    background-color: rgba(59, 130, 246, 0.1);
  }
}
`


