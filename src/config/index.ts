/**
 * 配置模块导出
 */

export { ViteConfigExtender, createViteConfigExtender, mergeViteConfigs } from './ViteConfigExtender'
export { MarkdownConfigResolver, createMarkdownConfigResolver } from './MarkdownConfigResolver'
export { MetadataGenerator, createMetadataGenerator } from './MetadataConfig'

export type { ViteConfigExtenderOptions } from './ViteConfigExtender'
export type { SeoMetadata, OpenGraphMetadata, TwitterCardMetadata, MetadataConfig } from './MetadataConfig'

