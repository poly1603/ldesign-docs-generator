<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面未找到</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<style scoped>
.not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center; }

h1 { font-size: 6rem; color: #42b983; margin-bottom: 1rem; }

p { font-size: 1.5rem; color: #666; margin-bottom: 2rem; }

a { padding: 0.75rem 1.5rem; background: #42b983; color: white; text-decoration: none; border-radius: 4px; transition: background 0.3s; }

a:hover { background: #33a06f; }
</style>
