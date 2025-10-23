/**
 * 构建优化模块导出
 */

export { CodeSplitter, createCodeSplitter } from './CodeSplitter'
export { ImageOptimizer, createImageOptimizer } from './ImageOptimizer'
export { PrefetchGenerator, createPrefetchGenerator } from './PrefetchGenerator'
export { CriticalCssExtractor, createCriticalCssExtractor } from './CriticalCssExtractor'

export type { CodeSplitterConfig, ChunkInfo } from './CodeSplitter'
export type { ImageOptimizerConfig, OptimizedImage } from './ImageOptimizer'
export type { PrefetchConfig, PrefetchResource } from './PrefetchGenerator'
export type { CriticalCssConfig } from './CriticalCssExtractor'


