/**
 * 错误处理中间件
 * 提供友好的错误页面和错误覆盖层
 */

import type { Connect } from 'vite'
import type { Logger } from '../../types'

/**
 * 创建错误处理中间件
 */
export function createErrorHandlerMiddleware(logger: Logger): Connect.NextHandleFunction {
  return (err: any, req, res, next) => {
    if (err) {
      logger.error('请求处理错误:', err)

      // 生成错误页面
      const errorHtml = generateErrorPage(err)

      res.statusCode = err.statusCode || 500
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(errorHtml)
    } else {
      next()
    }
  }
}

/**
 * 生成错误页面
 */
function generateErrorPage(error: any): string {
  const message = error.message || '服务器内部错误'
  const stack = error.stack || ''
  const statusCode = error.statusCode || 500

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusCode} - 错误</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 2rem;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
    }

    .error-code {
      font-size: 4rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .error-message {
      font-size: 1.5rem;
      opacity: 0.9;
    }

    .content {
      padding: 2rem;
    }

    .stack-trace {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1.5rem;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .tips {
      margin-top: 2rem;
      padding: 1rem;
      background: #f0f9ff;
      border-left: 4px solid #3b82f6;
      border-radius: 4px;
    }

    .tips h3 {
      color: #1e40af;
      margin-bottom: 0.5rem;
    }

    .tips ul {
      padding-left: 1.5rem;
      color: #475569;
    }

    .tips li {
      margin: 0.25rem 0;
    }

    .actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
    }

    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="error-code">${statusCode}</div>
      <div class="error-message">${escapeHtml(message)}</div>
    </div>

    <div class="content">
      <div class="stack-trace">${escapeHtml(stack)}</div>

      <div class="tips">
        <h3>💡 解决建议</h3>
        <ul>
          <li>检查配置文件语法是否正确</li>
          <li>确认所有依赖已正确安装</li>
          <li>查看浏览器控制台是否有额外错误信息</li>
          <li>尝试清除缓存后重新启动开发服务器</li>
        </ul>
      </div>

      <div class="actions">
        <button class="btn-primary" onclick="location.reload()">
          🔄 重新加载
        </button>
        <button class="btn-secondary" onclick="history.back()">
          ⬅️ 返回上一页
        </button>
      </div>
    </div>
  </div>

  <script>
    // 自动重连
    let retryCount = 0
    const maxRetries = 5

    function checkServer() {
      fetch(location.href)
        .then(() => {
          location.reload()
        })
        .catch(() => {
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(checkServer, 2000)
          }
        })
    }

    // 5秒后开始尝试重连
    setTimeout(checkServer, 5000)
  </script>
</body>
</html>`
}

/**
 * HTML 转义
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}


