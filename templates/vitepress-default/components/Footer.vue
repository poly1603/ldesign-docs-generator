<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>{{ title }}</h3>
          <p>{{ description }}</p>
        </div>

        <div class="footer-section">
          <h4>资源</h4>
          <ul class="footer-links">
            <li v-for="link in resourceLinks" :key="link.link">
              <a :href="link.link" target="_blank" rel="noopener">
                {{ link.text }}
              </a>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>社区</h4>
          <ul class="footer-links">
            <li v-for="link in communityLinks" :key="link.link">
              <a :href="link.link" target="_blank" rel="noopener">
                {{ link.text }}
              </a>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>关于</h4>
          <ul class="footer-links">
            <li v-for="link in aboutLinks" :key="link.link">
              <a :href="link.link">
                {{ link.text }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">
          {{ copyright }}
        </p>
        <div class="footer-social">
          <a
            v-for="social in socialLinks"
            :key="social.name"
            :href="social.link"
            :title="social.name"
            target="_blank"
            rel="noopener"
            class="social-link"
          >
            <component :is="social.icon" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('LDesign Docs Generator')
const description = ref('智能文档生成器 - 集成 VitePress 所有功能')
const copyright = ref('© 2025 LDesign Team. All rights reserved.')

const resourceLinks = ref([
  { text: '快速开始', link: '/guide/quick-start' },
  { text: 'API 参考', link: '/api/' },
  { text: '示例', link: '/examples/' },
  { text: 'FAQ', link: '/faq' },
])

const communityLinks = ref([
  { text: 'GitHub', link: 'https://github.com/ldesign/ldesign' },
  { text: 'Discord', link: '#' },
  { text: 'Twitter', link: '#' },
  { text: '问题反馈', link: 'https://github.com/ldesign/ldesign/issues' },
])

const aboutLinks = ref([
  { text: '关于我们', link: '/about' },
  { text: '团队', link: '/team' },
  { text: '博客', link: '/blog' },
  { text: '更新日志', link: '/changelog' },
])

const socialLinks = ref([
  { name: 'GitHub', link: 'https://github.com/ldesign/ldesign', icon: 'GithubIcon' },
  { name: 'Twitter', link: '#', icon: 'TwitterIcon' },
])
</script>

<style scoped>
.footer {
  background-color: var(--sidebar-bg);
  border-top: 1px solid var(--border-color);
  margin-top: 4rem;
}

.footer-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 3rem 2rem 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.footer-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.footer-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.footer-section p {
  color: #666;
  line-height: 1.6;
  font-size: 0.875rem;
}

.dark .footer-section p {
  color: #999;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: #666;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.dark .footer-links a {
  color: #999;
}

.footer-links a:hover {
  color: #42b983;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.copyright {
  color: #666;
  font-size: 0.875rem;
  margin: 0;
}

.dark .copyright {
  color: #999;
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border-radius: 50%;
  transition: all 0.2s;
  text-decoration: none;
}

.dark .social-link {
  color: #999;
}

.social-link:hover {
  color: #42b983;
  background-color: rgba(66, 185, 131, 0.1);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>


