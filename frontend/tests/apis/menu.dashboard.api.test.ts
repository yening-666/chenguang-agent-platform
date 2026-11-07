import { describe, expect, it } from 'vitest'

import { dashboardApi } from '@/apis/dashboard.api'
import { menuApi } from '@/apis/menu.api'
import { mockMenuRoutes } from '@/mock/data'

import { setupMockServer } from '../helpers/mock-server'

setupMockServer()

describe('apis/menu.api + dashboard.api：菜单路由权限与工作台（2 条）', () => {
  it('GET /menus：返回完整路由 × 权限码矩阵', async () => {
    const routes = await menuApi.list()
    expect(routes).toHaveLength(8)
    expect(routes).toEqual(mockMenuRoutes)
    expect(routes.every((r) => r.path && r.name && r.title)).toBe(true)
  })

  it('GET /menus：侧边栏可见项全部带权限码（FR-3 菜单级过滤依据）', async () => {
    const routes = await menuApi.list()
    const visible = routes.filter((r) => r.inMenu)
    expect(visible).toHaveLength(5)
    expect(visible.every((r) => r.permission !== null)).toBe(true)
    expect(visible.map((r) => r.permission)).toEqual([
      'dashboard:view', 'user:list', 'role:list', 'permission:list', 'permission:list',
    ])
  })

  it('GET /menus：公开路由与错误页无需权限码', async () => {
    const routes = await menuApi.list()
    const publicRoutes = routes.filter((r) => !r.inMenu)
    expect(publicRoutes.map((r) => r.path)).toEqual(['/login', '/403', '/:pathMatch(.*)*'])
    expect(publicRoutes.every((r) => r.permission === null)).toBe(true)
  })

  it('GET /dashboard/stats：返回四项统计', async () => {
    const stats = await dashboardApi.stats()
    expect(stats).toEqual({ userCount: 5, roleCount: 3, permissionCount: 10, todayLogins: 12 })
  })
})
