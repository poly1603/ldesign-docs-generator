/**
 * 模板相关类型声明
 */

declare module '*.ejs' {
  const content: string
  export default content
}

declare module 'gray-matter' {
  interface GrayMatterFile<I> {
    data: I
    content: string
    excerpt?: string
    orig: Buffer | string
    language: string
    matter: string
    stringify(lang: string): string
  }

  interface GrayMatterOption<I, O> {
    parser?: (input: string) => I
    eval?: boolean
    excerpt?: boolean | ((file: GrayMatterFile<I>, options: GrayMatterOption<I, O>) => string)
    excerpt_separator?: string
    engines?: {
      [index: string]: (input: string) => object
    }
    language?: string
    delimiters?: string | [string, string]
  }

  function matter<I = any, O = any>(
    input: string | Buffer,
    options?: GrayMatterOption<I, O>
  ): GrayMatterFile<I>

  export = matter
}




