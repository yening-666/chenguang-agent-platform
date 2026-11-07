<script setup lang="ts">
defineProps<{
  /** 空状态提示文案 */
  text?: string
}>()
</script>

<template>
  <div class="empty-state">
    <span class="empty-state__icon">📭</span>
    <p class="empty-state__text">{{ text || '暂无数据' }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  padding: 40px 0;
  text-align: center;
  color: var(--cg-muted);
}

.empty-state__icon {
  font-size: 32px;
}

.empty-state__text {
  margin-top: 8px;
}
</style>
