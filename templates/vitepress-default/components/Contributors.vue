<template>
  <div class="contributors">
    <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
      <path fill="currentColor"
        d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
    <span class="label">贡献者:</span>
    <div class="avatars">
      <a v-for="contributor in contributors" :key="contributor.name" :href="contributor.url" :title="contributor.name"
        class="avatar" target="_blank" rel="noopener noreferrer">
        <img v-if="contributor.avatar" :src="contributor.avatar" :alt="contributor.name" loading="lazy" />
        <span v-else class="avatar-text">{{ getInitials(contributor.name) }}</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Contributor {
  name: string
  avatar?: string
  url?: string
}

interface Props {
  contributors: Contributor[]
}

defineProps<Props>()

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style scoped>
.contributors {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: #666;
  font-size: 0.875rem;
}

.dark .contributors {
  color: #999;
}

.icon {
  flex-shrink: 0;
}

.label {
  font-weight: 500;
}

.avatars {
  display: flex;
  gap: 0.5rem;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--bg-color);
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  text-decoration: none;
}

.dark .avatar {
  background-color: #2a2a2a;
}

.avatar:hover {
  transform: scale(1.1);
  border-color: #42b983;
  z-index: 1;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  font-size: 0.625rem;
  font-weight: 600;
  color: #666;
}

.dark .avatar-text {
  color: #999;
}
</style>

