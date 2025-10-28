import { describe, it, expect } from 'vitest'
import { generateRoutesFromDocs } from '../../src/app/router'
import type { DocNode } from '../../src/types'

describe('Router', () => {
  it('should generate routes from docs and include 404', () => {
    const docs: DocNode[] = [
      {
        type: 'markdown',
        name: 'Getting Started',
        path: 'guide/getting-started.md',
        outputPath: 'guide/getting-started.html',
        metadata: {},
        content: {},
      },
    ]

    const routes = generateRoutesFromDocs(docs)

    expect(routes.length).toBe(2) // doc + 404
    expect(routes[0].path).toBe('/guide/getting-started')
    expect(routes[0].name).toBe('Getting Started')
    expect(routes[1].path).toBe('/:pathMatch(.*)*')
  })
})
