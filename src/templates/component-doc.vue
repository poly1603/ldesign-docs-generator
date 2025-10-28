<template>
  <div class="component-doc">
    <h1>{{ doc.name }}</h1>

    <p v-if="doc.content.description" class="description">{{ doc.content.description }}</p>

    <div v-if="doc.content.props?.length" class="props">
      <h2>Props</h2>
      <table>
        <thead>
          <tr>
            <th>属性</th>
            <th>类型</th>
            <th>必填</th>
            <th>默认值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prop in doc.content.props" :key="prop.name">
            <td><code>{{ prop.name }}</code></td>
            <td><code>{{ formatType(prop.type) }}</code></td>
            <td>{{ prop.required ? '是' : '否' }}</td>
            <td><code v-if="prop.defaultValue">{{ prop.defaultValue }}</code></td>
            <td>{{ prop.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="doc.content.events?.length" class="events">
      <h2>Events</h2>
      <table>
        <thead>
          <tr>
            <th>事件</th>
            <th>参数</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in doc.content.events" :key="event.name">
            <td><code>{{ event.name }}</code></td>
            <td>
              <code v-if="event.parameters">{{ event.parameters.map((p: any) => p.name).join(', ') }}</code>
            </td>
            <td>{{ event.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="doc.content.slots?.length" class="slots">
      <h2>Slots</h2>
      <table>
        <thead>
          <tr>
            <th>插槽</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slot in doc.content.slots" :key="slot.name">
            <td><code>{{ slot.name }}</code></td>
            <td>{{ slot.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="doc.content.examples?.length" class="examples">
      <h2>示例</h2>
      <div v-for="(example, i) in doc.content.examples" :key="i">
        <h3 v-if="example.title">{{ example.title }}</h3>
        <pre><code>{{ example.code }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentDocNode } from '../types'

defineProps<{ doc: ComponentDocNode }>()

function formatType(type: any): string {
  return typeof type === 'string' ? type : type.name || 'any'
}
</script>

<style scoped>
@import './api-doc.vue';
</style>
