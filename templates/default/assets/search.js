/**
 * 文档搜索功能
 * 
 * 客户端搜索实现
 */

(function () {
  'use strict';

  // 搜索索引
  let searchIndex = null;
  let miniSearch = null;

  // DOM 元素
  let searchInput = null;
  let searchResults = null;
  let searchOverlay = null;

  /**
   * 初始化搜索
   */
  async function initSearch() {
    // 获取 DOM 元素
    searchInput = document.querySelector('.search-input');
    searchResults = document.querySelector('.search-results');
    searchOverlay = document.querySelector('.search-overlay');

    if (!searchInput) {
      console.warn('搜索输入框未找到');
      return;
    }

    // 加载搜索索引
    try {
      await loadSearchIndex();
    } catch (error) {
      console.error('加载搜索索引失败:', error);
      return;
    }

    // 绑定事件
    bindEvents();
  }

  /**
   * 加载搜索索引
   */
  async function loadSearchIndex() {
    const response = await fetch('./search-index.json');
    if (!response.ok) {
      throw new Error('Failed to load search index');
    }

    searchIndex = await response.json();

    // 初始化 MiniSearch
    if (typeof MiniSearch !== 'undefined') {
      miniSearch = MiniSearch.loadJSON(searchIndex, {
        fields: ['title', 'content', 'tags'],
        storeFields: ['title', 'path', 'excerpt', 'tags'],
      });
    }
  }

  /**
   * 绑定事件
   */
  function bindEvents() {
    // 输入事件
    let debounceTimer = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        performSearch(e.target.value);
      }, 300);
    });

    // 键盘事件
    searchInput.addEventListener('keydown', handleKeyDown);

    // 点击遮罩关闭
    if (searchOverlay) {
      searchOverlay.addEventListener('click', closeSearch);
    }

    // Cmd/Ctrl + K 打开搜索
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      // ESC 关闭搜索
      if (e.key === 'Escape') {
        closeSearch();
      }
    });
  }

  /**
   * 执行搜索
   */
  function performSearch(query) {
    if (!query || query.trim().length < 2) {
      hideResults();
      return;
    }

    if (!miniSearch) {
      console.warn('搜索索引未加载');
      return;
    }

    // 搜索
    const results = miniSearch.search(query, {
      boost: { title: 2 },
      fuzzy: 0.2,
      prefix: true,
    });

    // 显示结果
    displayResults(results, query);
  }

  /**
   * 显示搜索结果
   */
  function displayResults(results, query) {
    if (!searchResults) return;

    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="search-no-results">
          <p>未找到 "${escapeHtml(query)}" 的相关结果</p>
        </div>
      `;
      showResults();
      return;
    }

    const html = results.slice(0, 10).map((result, index) => `
      <div class="search-result-item ${index === 0 ? 'active' : ''}" data-index="${index}">
        <a href="${result.path}" class="search-result-link">
          <div class="search-result-title">
            ${highlightText(result.title, query)}
          </div>
          ${result.excerpt ? `
            <div class="search-result-excerpt">
              ${highlightText(result.excerpt, query)}
            </div>
          ` : ''}
          ${result.tags && result.tags.length > 0 ? `
            <div class="search-result-tags">
              ${result.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </a>
      </div>
    `).join('');

    searchResults.innerHTML = html;
    showResults();
  }

  /**
   * 高亮文本
   */
  function highlightText(text, query) {
    if (!query) return escapeHtml(text);

    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark>$1</mark>');
  }

  /**
   * 转义 HTML
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 转义正则表达式
   */
  function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 处理键盘导航
   */
  function handleKeyDown(e) {
    if (!searchResults || !searchResults.children.length) return;

    const items = searchResults.querySelectorAll('.search-result-item');
    const activeItem = searchResults.querySelector('.search-result-item.active');
    let activeIndex = activeItem ? parseInt(activeItem.dataset.index) : 0;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
        updateActiveItem(items, activeIndex);
        break;

      case 'ArrowUp':
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        updateActiveItem(items, activeIndex);
        break;

      case 'Enter':
        e.preventDefault();
        if (activeItem) {
          const link = activeItem.querySelector('a');
          if (link) link.click();
        }
        break;
    }
  }

  /**
   * 更新激活项
   */
  function updateActiveItem(items, activeIndex) {
    items.forEach((item, index) => {
      if (index === activeIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * 显示结果
   */
  function showResults() {
    if (searchResults) {
      searchResults.classList.add('show');
    }
    if (searchOverlay) {
      searchOverlay.classList.add('show');
    }
  }

  /**
   * 隐藏结果
   */
  function hideResults() {
    if (searchResults) {
      searchResults.classList.remove('show');
    }
    if (searchOverlay) {
      searchOverlay.classList.remove('show');
    }
  }

  /**
   * 打开搜索
   */
  function openSearch() {
    if (searchInput) {
      searchInput.focus();
    }
  }

  /**
   * 关闭搜索
   */
  function closeSearch() {
    hideResults();
    if (searchInput) {
      searchInput.value = '';
      searchInput.blur();
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();



