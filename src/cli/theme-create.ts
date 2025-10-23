/**
 * 主题创建 CLI
 * 
 * 帮助用户快速创建自定义主题
 */

import fs from 'fs-extra'
import * as path from 'path'
import { Command } from 'commander'

/**
 * 主题模板
 */
interface ThemeTemplate {
  name: string
  description: string
  files: Record<string, string>
}

/**
 * 可用的主题模板
 */
const themeTemplates: Record<string, ThemeTemplate> = {
  blank: {
    name: 'blank',
    description: '空白主题，从头开始',
    files: {
      'templates/layout.ejs': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= doc.name %> - <%= site.title %></title>
  <link rel="stylesheet" href="/assets/main.css">
</head>
<body>
  <main>
    <%- content %>
  </main>
  <script src="/assets/main.js"></script>
</body>
</html>`,
      'assets/main.css': `/* 主题样式 */
body {
  margin: 0;
  font-family: sans-serif;
}`,
      'assets/main.js': `/* 主题脚本 */
console.log('Theme loaded')`,
      'theme.config.js': `module.exports = {
  name: 'my-theme',
  version: '1.0.0',
  styles: {},
}`,
    },
  },

  modern: {
    name: 'modern',
    description: '基于 modern 主题',
    files: {
      'theme.config.js': `module.exports = {
  name: 'my-modern-theme',
  version: '1.0.0',
  extends: 'modern',
  styles: {
    primaryColor: '#6366f1',
  },
}`,
    },
  },
}

/**
 * 创建主题
 */
export async function createTheme(
  themeName: string,
  options: {
    template?: string
    outputDir?: string
  } = {}
): Promise<void> {
  const { template = 'blank', outputDir = `./${themeName}` } = options

  console.log(`\n🎨 创建主题: ${themeName}\n`)

  // 获取模板
  const themeTemplate = themeTemplates[template]
  if (!themeTemplate) {
    console.error(`❌ 未知的模板: ${template}`)
    console.log(`可用模板: ${Object.keys(themeTemplates).join(', ')}`)
    process.exit(1)
  }

  // 创建目录
  await fs.ensureDir(outputDir)

  // 创建文件
  for (const [filePath, content] of Object.entries(themeTemplate.files)) {
    const fullPath = path.join(outputDir, filePath)
    await fs.ensureDir(path.dirname(fullPath))
    await fs.writeFile(fullPath, content, 'utf-8')
    console.log(`✓ 已创建: ${filePath}`)
  }

  // 创建 package.json
  const packageJson = {
    name: `@ldesign/docs-generator-theme-${themeName}`,
    version: '1.0.0',
    description: `${themeName} theme for @ldesign/docs-generator`,
    main: 'theme.config.js',
    files: ['templates', 'assets', 'theme.config.js'],
    keywords: ['ldesign', 'docs-generator', 'theme'],
    peerDependencies: {
      '@ldesign/docs-generator': '^2.0.0',
    },
  }

  await fs.writeJSON(
    path.join(outputDir, 'package.json'),
    packageJson,
    { spaces: 2 }
  )
  console.log('✓ 已创建: package.json')

  // 创建 README
  const readme = `# ${themeName}

基于 ${template} 模板创建的主题。

## 使用

\`\`\`bash
npm install @ldesign/docs-generator-theme-${themeName}
\`\`\`

\`\`\`typescript
import { defineConfig } from '@ldesign/docs-generator'

export default defineConfig({
  theme: {
    name: '${themeName}',
  },
})
\`\`\`

## 开发

编辑 \`templates/\` 和 \`assets/\` 目录中的文件来定制主题。

## 发布

\`\`\`bash
npm publish --access public
\`\`\`
`

  await fs.writeFile(path.join(outputDir, 'README.md'), readme, 'utf-8')
  console.log('✓ 已创建: README.md')

  console.log(`\n✨ 主题创建成功！`)
  console.log(`\n📁 主题目录: ${outputDir}`)
  console.log(`\n下一步:`)
  console.log(`  cd ${outputDir}`)
  console.log(`  编辑文件来定制你的主题`)
  console.log(`  npm publish 发布主题\n`)
}

/**
 * 主题定制 CLI
 */
export function registerThemeCommands(program: Command): void {
  const themeCommand = program
    .command('theme')
    .description('主题管理工具')

  // 创建主题
  themeCommand
    .command('create <name>')
    .description('创建新主题')
    .option('-t, --template <template>', '使用模板 (blank, modern)', 'blank')
    .option('-o, --output <dir>', '输出目录')
    .action(async (name, options) => {
      await createTheme(name, options)
    })

  // 列出可用模板
  themeCommand
    .command('list')
    .description('列出可用的主题模板')
    .action(() => {
      console.log('\n可用的主题模板:\n')
      Object.entries(themeTemplates).forEach(([key, template]) => {
        console.log(`  ${key.padEnd(15)} - ${template.description}`)
      })
      console.log()
    })

  // 验证主题
  themeCommand
    .command('validate <dir>')
    .description('验证主题结构')
    .action(async (dir) => {
      const { ThemeBuilder } = await import('../themes/ThemeBuilder')
      const { Logger } = await import('../core/Logger')

      const logger = new Logger('info')
      const builder = new ThemeBuilder({
        sourceDir: dir,
        outputDir: '/tmp',
        logger,
      })

      const result = await builder.validate(dir)

      if (result.valid) {
        console.log('✅ 主题验证通过')
      } else {
        console.log('❌ 主题验证失败:')
        result.errors.forEach(err => console.log(`  - ${err}`))
      }

      if (result.warnings.length > 0) {
        console.log('\n⚠️  警告:')
        result.warnings.forEach(warn => console.log(`  - ${warn}`))
      }
    })

  // 构建主题
  themeCommand
    .command('build <dir>')
    .description('构建主题包')
    .option('-o, --output <dir>', '输出目录', './dist')
    .action(async (dir, options) => {
      const { ThemeBuilder } = await import('../themes/ThemeBuilder')
      const { Logger } = await import('../core/Logger')

      const logger = new Logger('info')
      const builder = new ThemeBuilder({
        sourceDir: dir,
        outputDir: options.output,
        logger,
      })

      await builder.build()
    })
}


