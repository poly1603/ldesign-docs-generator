/**
 * 媒体处理插件
 * 
 * 优化图片和视频嵌入
 */

import type { DocsPlugin, DocNode, ParseContext } from '../../types'
import * as fs from 'fs-extra'
import * as path from 'path'

/**
 * 媒体插件选项
 */
export interface MediaPluginOptions {
  /** 是否启用图片懒加载 */
  lazyLoading?: boolean
  /** 是否启用图片优化 */
  imageOptimization?: boolean
  /** 是否启用灯箱效果 */
  lightbox?: boolean
  /** 视频自动播放 */
  videoAutoplay?: boolean
  /** 输出目录 */
  outputDir?: string
}

/**
 * 媒体插件
 */
export function mediaPlugin(options: MediaPluginOptions = {}): DocsPlugin {
  const {
    lazyLoading = true,
    imageOptimization = false,
    lightbox = true,
    videoAutoplay = false,
  } = options

  return {
    name: 'media',
    version: '1.0.0',
    description: '媒体处理和优化',

    /**
     * 转换文档节点，处理媒体元素
     */
    async transform(docs: DocNode[], context: ParseContext): Promise<DocNode[]> {
      const { logger } = context

      logger.debug('处理媒体元素...')

      for (const doc of docs) {
        if (doc.type === 'markdown' && doc.content.html) {
          let html = doc.content.html

          // 处理图片
          html = processImages(html, { lazyLoading, lightbox })

          // 处理视频
          html = processVideos(html, { videoAutoplay })

          doc.content.html = html
        }
      }

      return docs
    },
  }
}

/**
 * 处理图片
 */
function processImages(
  html: string,
  options: { lazyLoading?: boolean; lightbox?: boolean }
): string {
  const { lazyLoading, lightbox } = options

  // 匹配 img 标签
  return html.replace(
    /<img([^>]*)src="([^"]*)"([^>]*)>/g,
    (match, before, src, after) => {
      let attributes = before + after

      // 添加懒加载
      if (lazyLoading) {
        attributes += ' loading="lazy"'
      }

      // 添加灯箱支持
      if (lightbox) {
        const lightboxAttrs = `data-lightbox="true" class="lightbox-image"`
        attributes += ` ${lightboxAttrs}`
      }

      return `<img${attributes} src="${src}">`
    }
  )
}

/**
 * 处理视频
 */
function processVideos(
  html: string,
  options: { videoAutoplay?: boolean }
): string {
  const { videoAutoplay } = options

  // 处理 video 标签
  html = html.replace(
    /<video([^>]*)>/g,
    (match, attributes) => {
      let attrs = attributes

      // 添加控制条
      if (!attrs.includes('controls')) {
        attrs += ' controls'
      }

      // 添加预加载
      if (!attrs.includes('preload')) {
        attrs += ' preload="metadata"'
      }

      // 自动播放
      if (videoAutoplay && !attrs.includes('autoplay')) {
        attrs += ' autoplay muted' // autoplay 需要 muted
      }

      return `<video${attrs}>`
    }
  )

  // 处理 YouTube 嵌入
  html = html.replace(
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g,
    (match, videoId) => {
      return `<div class="video-container">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>`
    }
  )

  return html
}



