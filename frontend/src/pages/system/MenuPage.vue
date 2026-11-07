<script setup lang="ts">
import { onMounted } from 'vue'

import EmptyState from '@/components/common/EmptyState.vue'
import { useAuthStore } from '@/store/modules/auth.store'
import { useMenuStore } from '@/store/modules/menu.store'

const auth = useAuthStore()
const menuStore = useMenuStore()

onMounted(() => {
  void menuStore.fetchRoutes()
})
</script>

<template>
  <section>
    <div class="page-header">
      <h2>菜单路由权限</h2>
    </div>

    <p class="menus__tip">
      前端路由表 × 所需权限码矩阵：展示每条路由所需权限码、是否出现在侧边栏菜单、
      当前登录用户（{{ auth.userInfo?.nickname || '未登录' }}）是否可访问。
    </p>

    <EmptyState v-if="menuStore.routes.length === 0 && !menuStore.loading" text="暂无路由数据" />

    <table v-else class="table">
      <thead>
        <tr>
          <th>路由路径</th>
          <th>路由名称</th>
          <th>页面标题</th>
          <th>所需权限码</th>
          <th>菜单显隐</th>
          <th>当前用户可访问</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="route in menuStore.matrix" :key="route.path">
          <td><code>{{ route.path }}</code></td>
          <td><code>{{ route.name }}</code></td>
          <td>{{ route.title }}</td>
          <td>
            <code v-if="route.permission" class="menus__perm">{{ route.permission }}</code>
            <span v-else class="menus__free">登录即可</span>
          </td>
          <td>
            <span :class="route.inMenu ? 'menus__badge menus__badge--ok' : 'menus__badge menus__badge--off'">
              {{ route.inMenu ? '菜单可见' : '隐藏路由' }}
            </span>
          </td>
          <td>
            <span :class="route.hasPermission ? 'menus__badge menus__badge--ok' : 'menus__badge menus__badge--off'">
              {{ route.hasPermission ? '可访问' : '无权限（403）' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.menus__tip {
  color: var(--cg-muted);
  font-size: 13px;
  margin-bottom: 14px;
  line-height: 1.6;
}

.menus__perm {
  background: #eff6ff;
  color: var(--cg-primary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: Consolas, monospace;
  font-size: 12px;
}

.menus__free {
  color: var(--cg-muted);
  font-size: 12px;
}

.menus__badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.menus__badge--ok {
  background: #dcfce7;
  color: #16a34a;
}

.menus__badge--off {
  background: #fee2e2;
  color: #b91c1c;
}

code {
  font-family: Consolas, monospace;
  font-size: 12px;
}
</style>
