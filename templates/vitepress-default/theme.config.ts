/**
 * VitePress 默认主题配置
 */

export default {
  name: 'vitepress-default',
  version: '3.0.0',

  // 主题元数据
  meta: {
    author: 'LDesign Team',
    description: 'VitePress 风格的默认主题',
    tags: ['vitepress', 'vue', 'responsive', 'dark-mode'],
  },

  // 布局
  layouts: {
    default: './layouts/Layout.vue',
    home: './layouts/Home.vue',
    doc: './layouts/Doc.vue',
    page: './layouts/Page.vue',
  },

  // 组件
  components: {
    Navbar: './components/Navbar.vue',
    Sidebar: './components/Sidebar.vue',
    SidebarGroup: './components/SidebarGroup.vue',
    TOC: './components/TOC.vue',
    Footer: './components/Footer.vue',
    ThemeToggle: './components/ThemeToggle.vue',
    LanguageSwitcher: './components/LanguageSwitcher.vue',
    DocFooter: './components/DocFooter.vue',
    EditLink: './components/EditLink.vue',
    LastUpdated: './components/LastUpdated.vue',
    Contributors: './components/Contributors.vue',
    Comments: './components/Comments.vue',
    Feedback: './components/Feedback.vue',
    BackToTop: './components/BackToTop.vue',
    MobileMenu: './components/MobileMenu.vue',
  },

  // 样式
  styles: {
    vars: './styles/vars.css',
    layout: './styles/layout.css',
    components: './styles/components.css',
  },

  // 默认配置
  defaults: {
    // 导航
    navbar: {
      show: true,
      sticky: true,
    },
    sidebar: {
      show: true,
      collapsible: true,
      searchable: true,
    },
    toc: {
      show: true,
      level: [2, 3, 4],
    },
    footer: {
      show: true,
    },

    // 功能
    darkMode: {
      enabled: true,
      default: 'auto',
    },
    i18n: {
      enabled: true,
      defaultLocale: 'zh-CN',
    },
    search: {
      enabled: true,
      provider: 'local',
    },

    // 增强功能
    codeBlock: {
      lineNumbers: true,
      copyButton: true,
      theme: 'dark-plus',
    },
    markdown: {
      containers: true,
      emoji: true,
      anchor: true,
    },

    // 页面功能
    editLink: {
      enabled: true,
      pattern: 'https://github.com/:org/:repo/edit/:branch/:path',
    },
    lastUpdated: {
      enabled: true,
      fromGit: true,
    },
    contributors: {
      enabled: true,
      fromGit: true,
    },
    feedback: {
      enabled: true,
    },
    comments: {
      enabled: false,
    },
    backToTop: {
      enabled: true,
      threshold: 300,
    },

    // PWA
    pwa: {
      enabled: false,
    },

    // 分析
    analytics: {
      enabled: false,
    },
  },

  // 可定制选项
  customizable: [
    'colors.primary',
    'colors.background',
    'colors.text',
    'fonts.base',
    'fonts.mono',
    'layout.maxWidth',
    'sidebar.width',
    'toc.width',
  ],
}


