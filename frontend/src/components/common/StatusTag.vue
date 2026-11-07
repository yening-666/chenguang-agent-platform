<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** 1 = 启用（绿色），0 = 禁用（红色） */
  status: number
}>()

const label = computed(() => (props.status === 1 ? '启用' : '禁用'))
const kind = computed(() => (props.status === 1 ? 'ok' : 'off'))
</script>

<template>
  <span class="status-tag" :class="`status-tag--${kind}`">{{ label }}</span>
</template>

<style scoped>
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.status-tag--ok {
  background: #dcfce7;
  color: #16a34a;
}

.status-tag--off {
  background: #fee2e2;
  color: #b91c1c;
}
</style>
