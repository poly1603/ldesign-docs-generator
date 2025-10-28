<template>
  <div class="api-doc">
    <h1>{{ doc.name }}</h1>

    <div class="api-content">
      <div v-if="doc.content.signatures" class="signatures">
        <h2>签名</h2>
        <div v-for="(sig, i) in doc.content.signatures" :key="i" class="signature">
          <code>{{ formatSignature(sig) }}</code>
        </div>
      </div>

      <div v-if="doc.content.parameters?.length" class="parameters">
        <h2>参数</h2>
        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>必填</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="param in doc.content.parameters" :key="param.name">
              <td><code>{{ param.name }}</code></td>
              <td><code>{{ param.type.name }}</code></td>
              <td>{{ param.optional ? '否' : '是' }}</td>
              <td>{{ param.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="doc.content.returnType" class="return-type">
        <h2>返回值</h2>
        <p><code>{{ doc.content.returnType.name }}</code></p>
      </div>

      <div v-if="doc.content.examples?.length" class="examples">
        <h2>示例</h2>
        <div v-for="(example, i) in doc.content.examples" :key="i" class="example">
          <h3 v-if="example.title">{{ example.title }}</h3>
          <pre><code>{{ example.code }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { APIDocNode } from '../types'

const props = defineProps<{ doc: APIDocNode }>()

function formatSignature(sig: any): string {
  const params = sig.parameters?.map((p: any) => `${p.name}${p.optional ? '?' : ''}: ${p.type.name}`).join(', ') || ''
  return `${sig.name}(${params}): ${sig.returnType.name}`
}
</script>

<style scoped>
.api-doc { max-width: 1200px; margin: 0 auto; padding: 2rem; }

h1 { font-size: 2.5rem; margin-bottom: 2rem; color: #2c3e50; }

h2 { font-size: 1.75rem; margin-top: 2rem; margin-bottom: 1rem; color: #2c3e50; border-bottom: 2px solid #42b983; padding-bottom: 0.5rem; }

code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; font-family: 'Fira Code', monospace; font-size: 0.875em; }

pre { background: #1e1e1e; color: #d4d4d4; padding: 1.25rem; border-radius: 6px; overflow-x: auto; }

table { width: 100%; border-collapse: collapse; margin: 1rem 0; }

th, td { padding: 0.75rem; text-align: left; border: 1px solid #ddd; }

th { background: #f4f4f4; font-weight: 600; }

.signature { margin: 0.5rem 0; padding: 1rem; background: #f9f9f9; border-left: 4px solid #42b983; }
</style>
