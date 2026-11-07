import { menuApi } from '@/apis/menu.api'

import type { MenuRouteItem } from '@/types/rbac'

/** 菜单路由权限业务逻辑 */
export const menuService = {
  /** 菜单路由权限矩阵（与前端路由表一致，供菜单路由权限页展示） */
  getRoutes(): Promise<MenuRouteItem[]> {
    return menuApi.list()
  },
}
