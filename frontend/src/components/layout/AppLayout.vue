<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/store/modules/auth.store'

interface MenuItem {
  path: string
  label: string
  /** 所需权限码；null 表示无需权限 */
  permission: string | null
}

const MENU_ITEMS: MenuItem[] = [
  { path: '/dashboard', label: '工作台', permission: 'dashboard:view' },
  { path: '/system/users', label: '用户管理', permission: 'user:list' },
  { path: '/system/roles', label: '角色管理', permission: 'role:list' },
  { path: '/system/permissions', label: '权限管理', permission: 'permission:list' },
  { path: '/system/menus', label: '菜单路由权限', permission: 'permission:list' },
]

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

/** 按权限过滤侧边栏菜单（'*' 超管全部可见） */
const visibleMenus = computed(() =>
  MENU_ITEMS.filter((item) => !item.permission || auth.hasPermission(item.permission)),
)

async function handleLogout(): Promise<void> {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-layout">
    <aside class="app-layout__sidebar">
      <div class="app-layout__brand">晨光 Agent 平台</div>
      <nav class="app-layout__menu">
        <RouterLink
          v-for="item in visibleMenus"
          :key="item.path"
          :to="item.path"
          class="app-layout__menu-item"
          :class="{ 'app-layout__menu-item--active': route.path === item.path }"
        >
          <span>{{ item.label }}</span>
          <span v-if="item.permission" class="app-layout__menu-perm">{{ item.permission }}</span>
        </RouterLink>
      </nav>
    </aside>

    <div class="app-layout__main">
      <header class="app-layout__header">
        <span class="app-layout__welcome">
          {{ auth.userInfo?.nickname || '未登录' }}（{{ auth.userInfo?.username || '-' }}）
        </span>
        <button class="btn btn--sm" @click="handleLogout">退出登录</button>
      </header>
      <main class="app-layout__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-layout__sidebar {
  width: 220px;
  background: var(--cg-sidebar-bg);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
}

.app-layout__brand {
  padding: 20px 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.app-layout__menu {
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-layout__menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 14px;
}

.app-layout__menu-item--active {
  background: var(--cg-primary);
  color: #fff;
}

.app-layout__menu-perm {
  font-size: 11px;
  color: #64748b;
  font-family: Consolas, monospace;
}

.app-layout__menu-item--active .app-layout__menu-perm {
  color: #bfdbfe;
}

.app-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-layout__header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid var(--cg-border);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
}

.app-layout__welcome {
  color: var(--cg-muted);
}

.app-layout__content {
  flex: 1;
  padding: 20px;
}
</style>
