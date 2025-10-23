/**
 * 开发服务器
 */

import * as http from 'http'
import * as fs from 'fs-extra'
import * as path from 'path'

/**
 * 服务器选项
 */
export interface ServeOptions {
  /** 文档目录 */
  dir: string
  /** 端口号 */
  port: number
  /** 是否自动打开浏览器 */
  open?: boolean
}

/**
 * MIME 类型映射
 */
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
}

/**
 * 启动开发服务器
 */
export async function startDevServer(options: ServeOptions): Promise<http.Server> {
  const { dir, port } = options

  // 确保目录存在
  if (!(await fs.pathExists(dir))) {
    throw new Error(`目录不存在: ${dir}`)
  }

  const server = http.createServer(async (req, res) => {
    try {
      await handleRequest(req, res, dir)
    } catch (error) {
      console.error('请求处理错误:', error)
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('服务器内部错误')
    }
  })

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      console.log(`\n🚀 服务器已启动`)
      console.log(`📁 文档目录: ${dir}`)
      console.log(`🌐 本地地址: http://localhost:${port}`)
      console.log(`\n按 Ctrl+C 停止服务器\n`)

      // 自动打开浏览器
      if (options.open) {
        const url = `http://localhost:${port}`
        openBrowser(url)
      }

      resolve(server)
    })

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        reject(new Error(`端口 ${port} 已被占用`))
      } else {
        reject(error)
      }
    })
  })
}

/**
 * 处理请求
 */
async function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  baseDir: string
): Promise<void> {
  let url = req.url || '/'

  // 移除查询字符串
  const queryIndex = url.indexOf('?')
  if (queryIndex !== -1) {
    url = url.substring(0, queryIndex)
  }

  // 解码 URL
  url = decodeURIComponent(url)

  // 如果 URL 以斜杠结尾，添加 index.html
  if (url.endsWith('/')) {
    url += 'index.html'
  }

  // 构建文件路径
  const filePath = path.join(baseDir, url)

  // 安全检查：防止目录遍历攻击
  const realPath = path.resolve(filePath)
  const realBaseDir = path.resolve(baseDir)
  if (!realPath.startsWith(realBaseDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('403 禁止访问')
    return
  }

  // 检查文件是否存在
  if (!(await fs.pathExists(filePath))) {
    // 尝试添加 .html 扩展名
    const htmlPath = filePath + '.html'
    if (await fs.pathExists(htmlPath)) {
      await serveFile(htmlPath, res)
      return
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(generate404Page(url))
    return
  }

  // 检查是否是目录
  const stats = await fs.stat(filePath)
  if (stats.isDirectory()) {
    const indexPath = path.join(filePath, 'index.html')
    if (await fs.pathExists(indexPath)) {
      await serveFile(indexPath, res)
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(generate404Page(url))
    }
    return
  }

  // 提供文件
  await serveFile(filePath, res)
}

/**
 * 提供文件
 */
async function serveFile(
  filePath: string,
  res: http.ServerResponse
): Promise<void> {
  const ext = path.extname(filePath).toLowerCase()
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

  const content = await fs.readFile(filePath)

  res.writeHead(200, {
    'Content-Type': mimeType,
    'Content-Length': content.length,
  })
  res.end(content)
}

/**
 * 生成 404 页面
 */
function generate404Page(url: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - 页面未找到</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }
    .container {
      padding: 2rem;
    }
    h1 {
      font-size: 8rem;
      margin-bottom: 1rem;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    p {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    a {
      display: inline-block;
      padding: 1rem 2rem;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    a:hover {
      transform: translateY(-2px);
    }
    .url {
      margin-top: 2rem;
      font-size: 0.9rem;
      opacity: 0.7;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>页面未找到</p>
    <a href="/">返回首页</a>
    <div class="url">请求的路径: ${url}</div>
  </div>
</body>
</html>`
}

/**
 * 打开浏览器
 */
function openBrowser(url: string): void {
  const { exec } = require('child_process')
  const start =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'start'
        : 'xdg-open'

  exec(`${start} ${url}`)
}




