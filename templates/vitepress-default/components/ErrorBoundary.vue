<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">哎呀，出错了！</h2>
      <p class="error-message">{{ errorMessage }}</p>

      <details class="error-details" v-if="errorStack">
        <summary>错误详情</summary>
        <pre class="error-stack">{{ errorStack }}</pre>
      </details>

      <div class="error-actions">
        <button @click="retry" class="btn-primary">
          🔄 重试
        </button>
        <button @click="goHome" class="btn-secondary">
          🏠 返回首页
        </button>
        <button @click="reportIssue" class="btn-secondary">
          🐛 报告问题
        </button>
      </div>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')

onErrorCaptured((err: any) => {
  hasError.value = true
  errorMessage.value = err.message || '未知错误'
  errorStack.value = err.stack || ''

  // 记录错误
  console.error('[ErrorBoundary] 捕获错误:', err)

  // 发送错误报告（如果配置了分析）
  if (typeof gtag !== 'undefined') {
    gtag('event', 'exception', {
      description: err.message,
      fatal: false,
    })
  }

  // 阻止错误继续传播
  return false
})

function retry() {
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
  location.reload()
}

function goHome() {
  window.location.href = '/'
}

function reportIssue() {
  const title = encodeURIComponent(`Error: ${errorMessage.value}`)
  const body = encodeURIComponent(`
## 错误信息
${errorMessage.value}

## 错误堆栈
\`\`\`
${errorStack.value}
\`\`\`

## 环境信息
- URL: ${window.location.href}
- User Agent: ${navigator.userAgent}
- 时间: ${new Date().toISOString()}
`)
  window.open(`https://github.com/ldesign/ldesign/issues/new?title=${title}&body=${body}`)
}
</script>

<style scoped>
.error-boundary {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-container {
  max-width: 600px;
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.dark .error-container {
  background: #1a1a1a;
  color: #e4e4e7;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-10px);
  }

  75% {
    transform: translateX(10px);
  }
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #213547;
}

.dark .error-title {
  color: #e4e4e7;
}

.error-message {
  font-size: 1.125rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.dark .error-message {
  color: #999;
}

.error-details {
  text-align: left;
  margin-bottom: 2rem;
  background: #f5f5f5;
  border-radius: 6px;
  padding: 1rem;
}

.dark .error-details {
  background: #2a2a2a;
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #213547;
  user-select: none;
}

.dark .error-details summary {
  color: #e4e4e7;
}

.error-stack {
  margin-top: 1rem;
  padding: 1rem;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.error-actions button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-primary:hover {
  background: #33a06f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.4);
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.dark .btn-secondary {
  background: #374151;
  color: #e5e7eb;
}

.btn-secondary:hover {
  background: #d1d5db;
  transform: translateY(-2px);
}

.dark .btn-secondary:hover {
  background: #4b5563;
}
</style>
