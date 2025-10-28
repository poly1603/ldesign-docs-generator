import { describe, it, expect } from 'vitest'
import { generateRouteData } from '../../src/app/route-data-generator'
import type { DocNode } from '../../src/types'

describe('Route Data Generator', () => {
  it('should generate complete route data', async () => {
    const docs: DocNode[] = [
      {
        type: 'markdown',
        name: 'Getting Started',
        path: 'guide/getting-started.md',
        outputPath: 'guide/getting-started.html',
        metadata: { tags: ['guide'] },
        content: { raw: 'Getting started with docs' },
      },
      {
        type: 'api',
        name: 'MyFunction',
        path: 'api/my-function.md',
        outputPath: 'api/my-function.html',
        metadata: {},
        content: {},
      },
    ]

    const routeData = await generateRouteData(docs)

    expect(routeData.routes).toHaveLength(2)
    expect(routeData.sidebar).toBeTruthy()
    expect(routeData.navbar).toBeTruthy()
    expect(routeData.searchIndex).toHaveLength(2)
  })

  it('should generate correct route paths', async () => {
    const docs: DocNode[] = [
      {
        type: 'markdown',
        name: 'Home',
        path: 'index.md',
        outputPath: 'index.html',
        metadata: {},
        content: {},
      },
    ]

    const routeData = await generateRouteData(docs)

    expect(routeData.routes[0].path).toBe('/index')
    expect(routeData.routes[0].name).toBe('Home')
    expect(routeData.routes[0].type).toBe('markdown')
  })

  it('should generate search index with tags', async () => {
    const docs: DocNode[] = [
      {
        type: 'markdown',
        name: 'Test Doc',
        path: 'test.md',
        metadata: { tags: ['test', 'doc'] },
        content: { raw: 'Test content' },
      },
    ]

    const routeData = await generateRouteData(docs)
    const searchItem = routeData.searchIndex[0]

    expect(searchItem.title).toBe('Test Doc')
    expect(searchItem.tags).toContain('test')
    expect(searchItem.tags).toContain('doc')
    expect(searchItem.tags).toContain('markdown')
  })
})
