import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { menuService } from '@/services/menu.service'
import { useAuthStore } from '@/store/modules/auth.store'
import type { MenuRouteItem } from '@/types/rbac'

/** 菜单路由权限 store：路由权限矩阵 + 当前用户可访问性判定 */
export const useMenuStore = defineStore('menu', () => {
  const routes = ref<MenuRouteItem[]>([])
  const loading = ref(false)

  /** 拉取菜单路由权限矩阵 */
  async function fetchRoutes(): Promise<void> {
    loading.value = true
    try {
      routes.value = await menuService.getRoutes()
    } finally {
      loading.value = false
    }
  }

  /** 矩阵视图：路由 × 权限码 × 菜单显隐 × 当前用户可访问性 */
  const matrix = computed(() => {
    const auth = useAuthStore()
    return routes.value.map((route) => ({
      ...route,
      /** 当前用户是否拥有所需权限（null 权限码 = 登录即可） */
      hasPermission: route.permission === null || auth.hasPermission(route.permission),
    }))
  })

  return { routes, loading, matrix, fetchRoutes }
})
