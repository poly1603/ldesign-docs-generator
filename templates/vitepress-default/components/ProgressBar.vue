<template>
  <div v-if="isLoading" class="progress-bar" :class="{ 'indeterminate': indeterminate }">
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: indeterminate ? '30%' : `${percentage}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  percentage?: number
  indeterminate?: boolean
  autoHide?: boolean
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  percentage: 0,
  indeterminate: false,
  autoHide: true,
  duration: 2000,
})

const isLoading = ref(true)

watch(() => props.percentage, (newVal) => {
  if (newVal >= 100 && props.autoHide) {
    setTimeout(() => {
      isLoading.value = false
    }, props.duration)
  }
})

onMounted(() => {
  if (props.indeterminate) {
    isLoading.value = true
  }
})

// 暴露方法
defineExpose({
  show: () => {
    isLoading.value = true
  },
  hide: () => {
    isLoading.value = false
  },
})
</script>

<style scoped>
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  height: 3px;
}

.progress-track {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .progress-track {
  background-color: rgba(255, 255, 255, 0.05);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b983, #33a06f);
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(66, 185, 131, 0.5);
}

.progress-bar.indeterminate .progress-fill {
  animation: indeterminate 1.5s infinite;
}

@keyframes indeterminate {
  0% {
    left: -30%;
    width: 30%;
  }

  100% {
    left: 100%;
    width: 30%;
  }
}

.progress-fill {
  position: relative;
}

.progress-bar.indeterminate .progress-fill {
  position: absolute;
  top: 0;
}
</style>
