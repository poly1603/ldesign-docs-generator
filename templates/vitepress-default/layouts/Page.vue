<template>
  <div class="page-layout">
    <div class="page-container">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// 简单的页面布局，适用于自定义页面
</script>

<style scoped>
.page-layout {
  min-height: calc(100vh - 60px);
  background-color: var(--bg-color);
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

@media (max-width: 768px) {
  .page-container {
    padding: 2rem 1rem;
  }
}
</style>

