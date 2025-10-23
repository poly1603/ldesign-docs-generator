/**
 * 元数据配置
 * 管理站点的 SEO 和元数据
 */

/**
 * SEO 元数据
 */
export interface SeoMetadata {
  /** 页面标题 */
  title?: string
  /** 页面描述 */
  description?: string
  /** 关键词 */
  keywords?: string[]
  /** 作者 */
  author?: string
  /** 规范 URL */
  canonical?: string
  /** robots 标签 */
  robots?: string
}

/**
 * Open Graph 元数据
 */
export interface OpenGraphMetadata {
  /** OG 标题 */
  title?: string
  /** OG 描述 */
  description?: string
  /** OG 类型 */
  type?: 'website' | 'article'
  /** OG 图片 */
  image?: string
  /** OG URL */
  url?: string
  /** 站点名称 */
  siteName?: string
  /** 语言 */
  locale?: string
}

/**
 * Twitter Card 元数据
 */
export interface TwitterCardMetadata {
  /** 卡片类型 */
  card?: 'summary' | 'summary_large_image' | 'app' | 'player'
  /** 站点账号 */
  site?: string
  /** 创建者账号 */
  creator?: string
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
  /** 图片 */
  image?: string
}

/**
 * 元数据配置
 */
export interface MetadataConfig {
  /** SEO 元数据 */
  seo?: SeoMetadata
  /** Open Graph 元数据 */
  og?: OpenGraphMetadata
  /** Twitter Card 元数据 */
  twitter?: TwitterCardMetadata
  /** 自定义 meta 标签 */
  customMeta?: Array<{
    name?: string
    property?: string
    content: string
  }>
}

/**
 * 元数据生成器
 */
export class MetadataGenerator {
  /**
   * 生成 SEO meta 标签
   */
  generateSeoTags(seo: SeoMetadata): string[] {
    const tags: string[] = []

    if (seo.title) {
      tags.push(`<title>${escapeHtml(seo.title)}</title>`)
    }

    if (seo.description) {
      tags.push(`<meta name="description" content="${escapeHtml(seo.description)}">`)
    }

    if (seo.keywords && seo.keywords.length > 0) {
      tags.push(`<meta name="keywords" content="${escapeHtml(seo.keywords.join(', '))}">`)
    }

    if (seo.author) {
      tags.push(`<meta name="author" content="${escapeHtml(seo.author)}">`)
    }

    if (seo.canonical) {
      tags.push(`<link rel="canonical" href="${escapeHtml(seo.canonical)}">`)
    }

    if (seo.robots) {
      tags.push(`<meta name="robots" content="${escapeHtml(seo.robots)}">`)
    }

    return tags
  }

  /**
   * 生成 Open Graph meta 标签
   */
  generateOgTags(og: OpenGraphMetadata): string[] {
    const tags: string[] = []

    if (og.title) {
      tags.push(`<meta property="og:title" content="${escapeHtml(og.title)}">`)
    }

    if (og.description) {
      tags.push(`<meta property="og:description" content="${escapeHtml(og.description)}">`)
    }

    if (og.type) {
      tags.push(`<meta property="og:type" content="${og.type}">`)
    }

    if (og.image) {
      tags.push(`<meta property="og:image" content="${escapeHtml(og.image)}">`)
    }

    if (og.url) {
      tags.push(`<meta property="og:url" content="${escapeHtml(og.url)}">`)
    }

    if (og.siteName) {
      tags.push(`<meta property="og:site_name" content="${escapeHtml(og.siteName)}">`)
    }

    if (og.locale) {
      tags.push(`<meta property="og:locale" content="${og.locale}">`)
    }

    return tags
  }

  /**
   * 生成 Twitter Card meta 标签
   */
  generateTwitterTags(twitter: TwitterCardMetadata): string[] {
    const tags: string[] = []

    if (twitter.card) {
      tags.push(`<meta name="twitter:card" content="${twitter.card}">`)
    }

    if (twitter.site) {
      tags.push(`<meta name="twitter:site" content="${escapeHtml(twitter.site)}">`)
    }

    if (twitter.creator) {
      tags.push(`<meta name="twitter:creator" content="${escapeHtml(twitter.creator)}">`)
    }

    if (twitter.title) {
      tags.push(`<meta name="twitter:title" content="${escapeHtml(twitter.title)}">`)
    }

    if (twitter.description) {
      tags.push(`<meta name="twitter:description" content="${escapeHtml(twitter.description)}">`)
    }

    if (twitter.image) {
      tags.push(`<meta name="twitter:image" content="${escapeHtml(twitter.image)}">`)
    }

    return tags
  }

  /**
   * 生成自定义 meta 标签
   */
  generateCustomTags(customMeta: Array<{ name?: string; property?: string; content: string }>): string[] {
    return customMeta.map((meta) => {
      if (meta.name) {
        return `<meta name="${escapeHtml(meta.name)}" content="${escapeHtml(meta.content)}">`
      } else if (meta.property) {
        return `<meta property="${escapeHtml(meta.property)}" content="${escapeHtml(meta.content)}">`
      }
      return ''
    }).filter(Boolean)
  }

  /**
   * 生成所有 meta 标签
   */
  generateAll(metadata: MetadataConfig): string {
    const tags: string[] = []

    if (metadata.seo) {
      tags.push(...this.generateSeoTags(metadata.seo))
    }

    if (metadata.og) {
      tags.push(...this.generateOgTags(metadata.og))
    }

    if (metadata.twitter) {
      tags.push(...this.generateTwitterTags(metadata.twitter))
    }

    if (metadata.customMeta) {
      tags.push(...this.generateCustomTags(metadata.customMeta))
    }

    return tags.join('\n  ')
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
 * 创建元数据生成器
 */
export function createMetadataGenerator(): MetadataGenerator {
  return new MetadataGenerator()
}


