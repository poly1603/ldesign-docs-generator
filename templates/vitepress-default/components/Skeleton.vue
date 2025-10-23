<template>
  <div class="skeleton" :class="[type, { 'animated': animated }]" :style="customStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'text' | 'title' | 'avatar' | 'image' | 'button' | 'input'
  width?: string
  height?: string
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  animated: true,
})

const customStyle = computed(() => ({
  width: props.width,
  height: props.height,
}))
</script>

<style scoped>
.skeleton {
  background: linear-gradient(90deg,
      #f0f0f0 25%,
      #e0e0e0 50%,
      #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
}

.dark .skeleton {
  background: linear-gradient(90deg,
      #2a2a2a 25%,
      #3a3a3a 50%,
      #2a2a2a 75%);
}

.skeleton.animated {
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.skeleton.text {
  height: 1em;
  margin: 0.5em 0;
}

.skeleton.title {
  height: 2em;
  margin: 1em 0;
}

.skeleton.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton.image {
  width: 100%;
  height: 200px;
}

.skeleton.button {
  width: 100px;
  height: 36px;
  border-radius: 6px;
}

.skeleton.input {
  height: 40px;
  border-radius: 6px;
}
</style>
