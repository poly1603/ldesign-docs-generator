/**
 * @ldesign/docs-generator - 文档生成器
 */
export class DocsGenerator {
  async generateAPI(sourceDir: string) { console.info(`Generating API docs from ${sourceDir}`) }
  async generateComponents(componentsDir: string) { console.info(`Generating component docs from ${componentsDir}`) }
}
export function createDocsGenerator() { return new DocsGenerator() }

