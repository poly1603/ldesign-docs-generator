/**
 * 分析管理器
 * 集成 Google Analytics、百度统计等分析工具
 */

import type { Logger } from '../../types'

/**
 * 分析提供商
 */
export type AnalyticsProvider = 'google' | 'baidu' | 'custom'

/**
 * Google Analytics 配置
 */
export interface GoogleAnalyticsConfig {
  /** 测量 ID (G-XXXXXXXXXX) */
  measurementId: string
  /** 是否启用增强测量 */
  enhancedMeasurement?: boolean
  /** 自定义事件 */
  customEvents?: Record<string, any>
}

/**
 * 百度统计配置
 */
export interface BaiduAnalyticsConfig {
  /** 站点 ID */
  siteId: string
}

/**
 * 自定义分析配置
 */
export interface CustomAnalyticsConfig {
  /** 初始化脚本 */
  initScript: string
  /** 页面浏览追踪函数 */
  trackPageView?: string
  /** 事件追踪函数 */
  trackEvent?: string
}

/**
 * 分析配置
 */
export interface AnalyticsConfig {
  /** 是否启用 */
  enabled?: boolean
  /** Google Analytics */
  google?: GoogleAnalyticsConfig
  /** 百度统计 */
  baidu?: BaiduAnalyticsConfig
  /** 自定义分析 */
  custom?: CustomAnalyticsConfig
}

/**
 * 分析管理器
 */
export class AnalyticsManager {
  private config: AnalyticsConfig
  private logger: Logger

  constructor(config: AnalyticsConfig, logger: Logger) {
    this.config = config
    this.logger = logger
  }

  /**
   * 生成 Google Analytics 脚本
   */
  generateGoogleAnalyticsScript(): string {
    if (!this.config.google) {
      return ''
    }

    const { measurementId, enhancedMeasurement = true } = this.config.google

    return `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}', {
    'enhanced_measurement': ${enhancedMeasurement}
  });
</script>
`
  }

  /**
   * 生成百度统计脚本
   */
  generateBaiduAnalyticsScript(): string {
    if (!this.config.baidu) {
      return ''
    }

    const { siteId } = this.config.baidu

    return `
<!-- 百度统计 -->
<script>
  var _hmt = _hmt || [];
  (function() {
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?${siteId}";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
  })();
</script>
`
  }

  /**
   * 生成自定义分析脚本
   */
  generateCustomAnalyticsScript(): string {
    if (!this.config.custom) {
      return ''
    }

    return `
<!-- 自定义分析 -->
<script>
  ${this.config.custom.initScript}
</script>
`
  }

  /**
   * 生成所有分析脚本
   */
  generateAllScripts(): string {
    if (!this.config.enabled) {
      return ''
    }

    const scripts: string[] = []

    if (this.config.google) {
      scripts.push(this.generateGoogleAnalyticsScript())
    }

    if (this.config.baidu) {
      scripts.push(this.generateBaiduAnalyticsScript())
    }

    if (this.config.custom) {
      scripts.push(this.generateCustomAnalyticsScript())
    }

    return scripts.join('\n')
  }

  /**
   * 生成客户端追踪脚本
   */
  generateClientTrackingScript(): string {
    return `
<script>
// 页面浏览追踪
window.addEventListener('load', () => {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_path: window.location.pathname,
      page_title: document.title
    })
  }

  // 百度统计
  if (typeof _hmt !== 'undefined') {
    _hmt.push(['_trackPageview', window.location.pathname])
  }

  ${this.config.custom?.trackPageView || ''}
})

// 出站链接追踪
document.addEventListener('click', (e) => {
  const link = e.target.closest('a')
  if (!link) return

  const href = link.href
  if (href && href.startsWith('http') && !href.includes(window.location.hostname)) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'outbound_click', {
        link_url: href,
        link_text: link.textContent
      })
    }

    ${this.config.custom?.trackEvent || ''}
  }
})

// 搜索追踪
document.addEventListener('search', (e) => {
  if (e.detail && e.detail.query) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search', {
        search_term: e.detail.query
      })
    }
  }
})
</script>
`
  }
}

/**
 * 创建分析管理器
 */
export function createAnalyticsManager(config: AnalyticsConfig, logger: Logger): AnalyticsManager {
  return new AnalyticsManager(config, logger)
}


