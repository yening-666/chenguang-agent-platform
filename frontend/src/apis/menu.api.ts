import { request } from './http'

import type { MenuRouteItem } from '@/types/rbac'

/** 菜单路由权限模块 API */
export const menuApi = {
  /** GET /menus —— 登录即可（菜单路由权限矩阵，与前端路由表一致） */
  list: () => request.get<MenuRouteItem[]>('/menus'),
}
