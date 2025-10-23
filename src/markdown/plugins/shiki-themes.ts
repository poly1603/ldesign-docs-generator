/**
 * Shiki 主题管理器
 * 管理和切换代码高亮主题
 */

/**
 * 内置主题列表
 */
export const BUILTIN_THEMES = {
  // 暗色主题
  dark: [
    'dark-plus',
    'dracula',
    'github-dark',
    'monokai',
    'nord',
    'one-dark-pro',
    'poimandres',
    'rose-pine',
    'slack-dark',
    'solarized-dark',
    'vitesse-dark',
  ],
  // 浅色主题
  light: [
    'light-plus',
    'github-light',
    'min-light',
    'slack-ochin',
    'solarized-light',
    'vitesse-light',
  ],
} as const

/**
 * 主题配对（暗色-浅色）
 */
export const THEME_PAIRS: Record<string, { light: string; dark: string }> = {
  'github': {
    light: 'github-light',
    dark: 'github-dark',
  },
  'vscode': {
    light: 'light-plus',
    dark: 'dark-plus',
  },
  'vitesse': {
    light: 'vitesse-light',
    dark: 'vitesse-dark',
  },
  'solarized': {
    light: 'solarized-light',
    dark: 'solarized-dark',
  },
  'slack': {
    light: 'slack-ochin',
    dark: 'slack-dark',
  },
}

/**
 * 获取主题对
 */
export function getThemePair(themeName: string): { light: string; dark: string } {
  // 检查是否是预定义的主题对
  if (THEME_PAIRS[themeName]) {
    return THEME_PAIRS[themeName]
  }

  // 检查是否是单个主题名
  const allDarkThemes = BUILTIN_THEMES.dark
  const allLightThemes = BUILTIN_THEMES.light

  if (allDarkThemes.includes(themeName as any)) {
    return {
      light: 'light-plus',
      dark: themeName,
    }
  }

  if (allLightThemes.includes(themeName as any)) {
    return {
      light: themeName,
      dark: 'dark-plus',
    }
  }

  // 默认
  return {
    light: 'light-plus',
    dark: 'dark-plus',
  }
}

/**
 * 检查主题是否存在
 */
export function isThemeAvailable(themeName: string): boolean {
  return (
    BUILTIN_THEMES.dark.includes(themeName as any) ||
    BUILTIN_THEMES.light.includes(themeName as any)
  )
}

/**
 * 获取所有可用主题
 */
export function getAllThemes(): string[] {
  return [...BUILTIN_THEMES.dark, ...BUILTIN_THEMES.light]
}

/**
 * 主题元数据
 */
export interface ThemeMetadata {
  name: string
  displayName: string
  type: 'dark' | 'light'
  colors: {
    background: string
    foreground: string
    primary: string
  }
}

/**
 * 获取主题元数据
 */
export function getThemeMetadata(themeName: string): ThemeMetadata | null {
  const metadata: Record<string, ThemeMetadata> = {
    'dark-plus': {
      name: 'dark-plus',
      displayName: 'Dark+',
      type: 'dark',
      colors: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        primary: '#4fc1ff',
      },
    },
    'light-plus': {
      name: 'light-plus',
      displayName: 'Light+',
      type: 'light',
      colors: {
        background: '#ffffff',
        foreground: '#000000',
        primary: '#0000ff',
      },
    },
    'monokai': {
      name: 'monokai',
      displayName: 'Monokai',
      type: 'dark',
      colors: {
        background: '#272822',
        foreground: '#f8f8f2',
        primary: '#f92672',
      },
    },
    'nord': {
      name: 'nord',
      displayName: 'Nord',
      type: 'dark',
      colors: {
        background: '#2e3440',
        foreground: '#d8dee9',
        primary: '#88c0d0',
      },
    },
    'one-dark-pro': {
      name: 'one-dark-pro',
      displayName: 'One Dark Pro',
      type: 'dark',
      colors: {
        background: '#282c34',
        foreground: '#abb2bf',
        primary: '#61afef',
      },
    },
  }

  return metadata[themeName] || null
}

