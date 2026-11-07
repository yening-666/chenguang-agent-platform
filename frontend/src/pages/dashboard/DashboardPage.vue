<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { dashboardService } from '@/services/dashboard.service'
import { useAuthStore } from '@/store/modules/auth.store'
import type { DashboardStats } from '@/types/rbac'

const auth = useAuthStore()
const stats = ref<DashboardStats | null>(null)
const errorText = ref('')

onMounted(async () => {
  try {
    stats.value = await dashboardService.getStats()
  } catch {
    errorText.value = '统计数据加载失败'
  }
})
</script>

<template>
  <section>
    <h2 class="dashboard__title">工作台</h2>

    <p v-if="errorText" class="dashboard__error">{{ errorText }}</p>

    <div v-else-if="stats" class="dashboard__cards">
      <div class="dashboard__card">
        <span class="dashboard__card-label">用户总数</span>
        <strong class="dashboard__card-value">{{ stats.userCount }}</strong>
      </div>
      <div class="dashboard__card">
        <span class="dashboard__card-label">角色总数</span>
        <strong class="dashboard__card-value">{{ stats.roleCount }}</strong>
      </div>
      <div class="dashboard__card">
        <span class="dashboard__card-label">权限总数</span>
        <strong class="dashboard__card-value">{{ stats.permissionCount }}</strong>
      </div>
      <div class="dashboard__card">
        <span class="dashboard__card-label">今日登录</span>
        <strong class="dashboard__card-value">{{ stats.todayLogins }}</strong>
      </div>
    </div>

    <div class="dashboard__panel">
      <h3>我的权限</h3>
      <p class="dashboard__perms">
        <span v-if="auth.hasPermission('*')" class="dashboard__perm-badge">全部权限（超级管理员）</span>
        <template v-else>
          <span
            v-for="code in auth.permissions"
            :key="code"
            class="dashboard__perm-badge"
          >{{ code }}</span>
          <span v-if="auth.permissions.length === 0" class="dashboard__perm-empty">无任何权限</span>
        </template>
      </p>
    </div>
  </section>
</template>

<style scoped>
.dashboard__title {
  margin-bottom: 16px;
  font-size: 18px;
}

.dashboard__error {
  color: #b91c1c;
}

.dashboard__cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.dashboard__card {
  background: #fff;
  border: 1px solid var(--cg-border);
  border-radius: 8px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dashboard__card-label {
  color: var(--cg-muted);
  font-size: 13px;
}

.dashboard__card-value {
  font-size: 24px;
  color: var(--cg-primary);
}

.dashboard__panel {
  background: #fff;
  border: 1px solid var(--cg-border);
  border-radius: 8px;
  padding: 18px;
}

.dashboard__panel h3 {
  font-size: 15px;
  margin-bottom: 10px;
}

.dashboard__perms {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dashboard__perm-badge {
  background: #eff6ff;
  color: var(--cg-primary);
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-family: Consolas, monospace;
}

.dashboard__perm-empty {
  color: var(--cg-muted);
  font-size: 13px;
}
</style>
