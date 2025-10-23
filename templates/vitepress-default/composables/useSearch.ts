/**
 * 搜索组合式函数
 * 提供搜索功能和状态管理
 */

import { ref, onMounted } from 'vue'
import MiniSearch from 'minisearch'

interface SearchResult {
  id: string
  title: string
  url: string
  excerpt?: string
  score?: number
}

interface Document {
  id: string
  title: string
  url: string
  content: string
  tags?: string[]
}

export function useSearch() {
  const results = ref<SearchResult[]>([])
  const isSearching = ref(false)
  const searchHistory = ref<string[]>([])

  let miniSearch: MiniSearch | null = null

  /**
   * 初始化搜索引擎
   */
  async function initSearch() {
    try {
      // 加载搜索索引
      const response = await fetch('/search-index.json')
      const documents: Document[] = await response.json()

      // 创建 MiniSearch 实例
      miniSearch = new MiniSearch({
        fields: ['title', 'content', 'tags'],
        storeFields: ['title', 'url', 'content'],
        searchOptions: {
          boost: { title: 2 },
          fuzzy: 0.2,
          prefix: true,
        },
      })

      // 添加文档
      miniSearch.addAll(documents)
    } catch (error) {
      console.error('初始化搜索失败:', error)
    }
  }

  /**
   * 搜索
   */
  async function search(query: string) {
    if (!query.trim()) {
      results.value = []
      return
    }

    isSearching.value = true

    try {
      if (!miniSearch) {
        await initSearch()
      }

      if (miniSearch) {
        const searchResults = miniSearch.search(query, {
          boost: { title: 2 },
          fuzzy: 0.2,
          prefix: true,
        })

        results.value = searchResults.slice(0, 10).map((result: any) => ({
          id: result.id,
          title: result.title,
          url: result.url,
          excerpt: extractExcerpt(result.content, query),
          score: result.score,
        }))

        // 添加到搜索历史
        if (!searchHistory.value.includes(query)) {
          searchHistory.value.unshift(query)
          searchHistory.value = searchHistory.value.slice(0, 10)
          localStorage.setItem('search-history', JSON.stringify(searchHistory.value))
        }
      }
    } catch (error) {
      console.error('搜索失败:', error)
      results.value = []
    } finally {
      isSearching.value = false
    }
  }

  /**
   * 提取摘要
   */
  function extractExcerpt(content: string, query: string, length: number = 150): string {
    const lowerContent = content.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const index = lowerContent.indexOf(lowerQuery)

    if (index === -1) {
      return content.slice(0, length) + '...'
    }

    const start = Math.max(0, index - 50)
    const end = Math.min(content.length, index + query.length + 100)

    let excerpt = content.slice(start, end)
    if (start > 0) excerpt = '...' + excerpt
    if (end < content.length) excerpt = excerpt + '...'

    return excerpt
  }

  /**
   * 加载搜索历史
   */
  function loadSearchHistory() {
    try {
      const saved = localStorage.getItem('search-history')
      if (saved) {
        searchHistory.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error)
    }
  }

  /**
   * 清除搜索历史
   */
  function clearSearchHistory() {
    searchHistory.value = []
    localStorage.removeItem('search-history')
  }

  onMounted(() => {
    loadSearchHistory()
    initSearch()
  })

  return {
    results,
    isSearching,
    searchHistory,
    search,
    clearSearchHistory,
  }
}

