/**
 * Modern 主题脚本
 */

(function () {
  'use strict';

  // 主题切换
  function initThemeToggle() {
    const toggle = document.querySelector('.theme-toggle')
    if (!toggle) return

    // 获取保存的主题或系统偏好
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = savedTheme || (prefersDark ? 'dark' : 'light')

    document.documentElement.setAttribute('data-theme', theme)

    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme')
      const newTheme = current === 'dark' ? 'light' : 'dark'

      document.documentElement.setAttribute('data-theme', newTheme)
      localStorage.setItem('theme', newTheme)
    })
  }

  // 侧边栏高亮
  function initSidebarHighlight() {
    const currentPath = window.location.pathname
    const links = document.querySelectorAll('.sidebar-link')

    links.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active')
      }
    })
  }

  // 滚动监听（TOC 高亮）
  function initScrollSpy() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            const tocLinks = document.querySelectorAll('.toc-link')

            tocLinks.forEach(link => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active')
              } else {
                link.classList.remove('active')
              }
            })
          }
        })
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
      if (heading.id) {
        observer.observe(heading)
      }
    })
  }

  // 移动端侧边栏
  function initMobileSidebar() {
    const sidebar = document.querySelector('.sidebar')
    if (!sidebar) return

    // 创建切换按钮
    const toggle = document.createElement('button')
    toggle.className = 'mobile-sidebar-toggle'
    toggle.innerHTML = '☰'
    toggle.setAttribute('aria-label', '打开菜单')

    document.body.appendChild(toggle)

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open')
    })

    // 点击遮罩关闭
    const overlay = document.createElement('div')
    overlay.className = 'sidebar-overlay'

    document.body.appendChild(overlay)

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open')
    })

    sidebar.addEventListener('transitionend', () => {
      overlay.classList.toggle('show', sidebar.classList.contains('open'))
    })
  }

  // 代码复制
  function initCodeCopy() {
    document.querySelectorAll('pre code').forEach(block => {
      const pre = block.parentElement
      const button = document.createElement('button')
      button.className = 'code-copy-button'
      button.textContent = '复制'

      pre.style.position = 'relative'
      pre.appendChild(button)

      button.addEventListener('click', async () => {
        const code = block.textContent
        try {
          await navigator.clipboard.writeText(code)
          button.textContent = '已复制!'
          setTimeout(() => {
            button.textContent = '复制'
          }, 2000)
        } catch (error) {
          console.error('复制失败:', error)
        }
      })
    })
  }

  // 初始化
  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle()
    initSidebarHighlight()
    initScrollSpy()
    initMobileSidebar()
    initCodeCopy()
  })
})();



