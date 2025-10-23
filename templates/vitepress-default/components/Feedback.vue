<template>
  <div class="feedback" v-if="!submitted">
    <p class="feedback-question">{{ question }}</p>
    <div class="feedback-buttons">
      <button class="feedback-btn positive" @click="submitFeedback(true)">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor"
            d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
        </svg>
        <span>{{ positiveText }}</span>
      </button>
      <button class="feedback-btn negative" @click="submitFeedback(false)">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor"
            d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
        </svg>
        <span>{{ negativeText }}</span>
      </button>
    </div>
  </div>
  <div v-else class="feedback-thanks">
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
    <span>{{ thanksText }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  question?: string
  positiveText?: string
  negativeText?: string
  thanksText?: string
}

const props = withDefaults(defineProps<Props>(), {
  question: '这个页面对你有帮助吗？',
  positiveText: '有帮助',
  negativeText: '没帮助',
  thanksText: '感谢你的反馈！',
})

const submitted = ref(false)

function submitFeedback(isPositive: boolean) {
  // 发送反馈到分析系统
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_feedback', {
      page_path: window.location.pathname,
      feedback_value: isPositive ? 'positive' : 'negative',
    })
  }

  // 可以发送到后端API
  // await fetch('/api/feedback', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     path: window.location.pathname,
  //     isPositive,
  //     timestamp: Date.now(),
  //   })
  // })

  submitted.value = true
}
</script>

<style scoped>
.feedback {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  text-align: center;
}

.dark .feedback {
  background-color: rgba(255, 255, 255, 0.02);
}

.feedback-question {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.feedback-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.feedback-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  color: var(--text-color);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.feedback-btn:hover {
  border-color: #42b983;
  background-color: rgba(66, 185, 131, 0.05);
  transform: translateY(-1px);
}

.feedback-btn.positive:hover {
  color: #42b983;
}

.feedback-btn.negative:hover {
  color: #f56c6c;
  border-color: #f56c6c;
  background-color: rgba(245, 108, 108, 0.05);
}

.feedback-thanks {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  color: #42b983;
  font-weight: 500;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .feedback-buttons {
    flex-direction: column;
  }

  .feedback-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

