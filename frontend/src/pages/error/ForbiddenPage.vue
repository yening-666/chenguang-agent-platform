<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const missingPerm = computed(() =>
  typeof route.query.perm === 'string' ? route.query.perm : '',
)
</script>

<template>
  <div class="error-page">
    <h1>403</h1>
    <p class="error-page__text">抱歉，您没有访问该页面的权限</p>
    <p v-if="missingPerm" class="error-perm">
      缺失权限码：<code>{{ missingPerm }}</code>
    </p>
    <p class="error-page__hint">请联系管理员分配角色，或返回工作台</p>
  </div>
</template>

<style scoped>
.error-page__text {
  color: var(--cg-muted);
}

.error-page__hint {
  font-size: 12px;
  color: var(--cg-muted);
}
</style>
