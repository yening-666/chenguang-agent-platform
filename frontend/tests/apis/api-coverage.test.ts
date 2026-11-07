import { describe, expect, it } from 'vitest'

import { authApi } from '@/apis/auth.api'
import { dashboardApi } from '@/apis/dashboard.api'
import { menuApi } from '@/apis/menu.api'
import { permissionApi } from '@/apis/permission.api'
import { roleApi } from '@/apis/role.api'
import { userApi } from '@/apis/user.api'

import { setupMockServer } from '../helpers/mock-server'

/**
 * 全 API 覆盖清单（对齐 PRD 第八节接口鉴权矩阵 + 认证/工作台/菜单路由）
 * 共 27 条：认证 3 + 用户 9 + 角色 7 + 权限 6 + 菜单 1 + 工作台 1
 */
export const API_MATRIX = [
  { method: 'POST', path: '/auth/login', permission: '公开', api: 'authApi.login' },
  { method: 'POST', path: '/auth/logout', permission: '登录即可', api: 'authApi.logout' },
  { method: 'GET', path: '/auth/profile', permission: '登录即可', api: 'authApi.profile' },
  { method: 'GET', path: '/users/me', permission: '登录即可', api: 'userApi.me' },
  { method: 'GET', path: '/users/search', permission: 'user:list', api: 'userApi.search' },
  { method: 'GET', path: '/users', permission: 'user:list', api: 'userApi.page' },
  { method: 'GET', path: '/users/{id}', permission: 'user:read', api: 'userApi.getById' },
  { method: 'GET', path: '/users/{id}/roles', permission: 'user:read', api: 'userApi.getRoles' },
  { method: 'POST', path: '/users', permission: 'user:create', api: 'userApi.create' },
  { method: 'PUT', path: '/users/{id}', permission: 'user:update', api: 'userApi.update' },
  { method: 'PUT', path: '/users/{id}/roles', permission: 'user:assign_roles', api: 'userApi.assignRoles' },
  { method: 'DELETE', path: '/users/{id}', permission: 'user:delete', api: 'userApi.remove' },
  { method: 'GET', path: '/roles/search', permission: 'role:list', api: 'roleApi.search' },
  { method: 'GET', path: '/roles', permission: 'role:list', api: 'roleApi.list' },
  { method: 'GET', path: '/roles/{id}', permission: 'role:read', api: 'roleApi.getById' },
  { method: 'POST', path: '/roles', permission: 'role:create', api: 'roleApi.create' },
  { method: 'PUT', path: '/roles/{id}', permission: 'role:update', api: 'roleApi.update' },
  { method: 'PUT', path: '/roles/{id}/permissions', permission: 'role:assign_permissions', api: 'roleApi.assignPermissions' },
  { method: 'DELETE', path: '/roles/{id}', permission: 'role:delete', api: 'roleApi.remove' },
  { method: 'GET', path: '/permissions/search', permission: 'permission:list', api: 'permissionApi.search' },
  { method: 'GET', path: '/permissions', permission: 'permission:list', api: 'permissionApi.list' },
  { method: 'GET', path: '/permissions/{id}', permission: 'permission:read', api: 'permissionApi.getById' },
  { method: 'POST', path: '/permissions', permission: 'permission:create', api: 'permissionApi.create' },
  { method: 'PUT', path: '/permissions/{id}', permission: 'permission:update', api: 'permissionApi.update' },
  { method: 'DELETE', path: '/permissions/{id}', permission: 'permission:delete', api: 'permissionApi.remove' },
  { method: 'GET', path: '/menus', permission: '登录即可', api: 'menuApi.list' },
  { method: 'GET', path: '/dashboard/stats', permission: 'dashboard:view', api: 'dashboardApi.stats' },
] as const

/** 逐条调用全部 27 个 API 方法（顺序保证写操作不破坏后续读操作） */
const CALLS: Array<() => Promise<unknown>> = [
  () => authApi.login('admin', '123456'),
  () => authApi.profile(),
  () => authApi.logout(),
  () => userApi.me(),
  () => userApi.search('admin'),
  () => userApi.page({ page: 1, pageSize: 10 }),
  () => userApi.getById(1),
  () => userApi.getRoles(1),
  () => userApi.create({ username: 'newbie', nickname: '新用户' }),
  () => userApi.update(2, { nickname: '系统管理员A' }),
  () => userApi.assignRoles(3, { roleIds: [1, 2] }),
  () => roleApi.search('admin'),
  () => roleApi.list(),
  () => roleApi.getById(1),
  () => roleApi.create({ code: 'auditor', name: '审计员' }),
  () => roleApi.update(2, { name: '系统管理员B' }),
  () => roleApi.assignPermissions(2, { permissionIds: [1, 2] }),
  () => permissionApi.search('user'),
  () => permissionApi.list(),
  () => permissionApi.getById(1),
  () => permissionApi.create({
    code: 'audit:list', name: '审计查询', module: 'audit', moduleName: '审计管理',
  }),
  () => permissionApi.update(3, { name: '用户创建A' }),
  () => menuApi.list(),
  () => dashboardApi.stats(),
  () => userApi.remove(5),
  () => roleApi.remove(3),
  () => permissionApi.remove(10),
]

/** 把具体 id 归一化为 {id}，便于与接口清单比对 */
function normalize(url: string): string {
  return url.replace(/\/\d+(?=\/|$)/g, '/{id}')
}

const server = setupMockServer()

describe('全 API 覆盖矩阵：27 条接口逐条调用校验', () => {
  it('清单规模与去重：27 条接口、无重复', () => {
    expect(API_MATRIX).toHaveLength(27)
    const keys = API_MATRIX.map((item) => `${item.method} ${item.path}`)
    expect(new Set(keys).size).toBe(27)
  })

  it('全部 API 方法均可被真实调用且请求确实抵达 mock 层', async () => {
    // 只要请求发出即视为覆盖；业务失败（如未登录）不影响覆盖判定
    await Promise.allSettled(CALLS.map((call) => call()))

    const actual = new Set<string>()
    const methods = ['get', 'post', 'put', 'delete'] as const
    for (const method of methods) {
      for (const config of server.mock.history[method]) {
        actual.add(`${method.toUpperCase()} ${normalize(String(config.url ?? ''))}`)
      }
    }

    const missing = API_MATRIX.filter(
      (item) => !actual.has(`${item.method} ${item.path}`),
    )
    expect(missing).toEqual([])
    expect(actual.size).toBe(27)
  })

  it('覆盖清单与鉴权矩阵一致：业务写操作 11 条全部带具体权限码', () => {
    const writeApis = API_MATRIX.filter(
      (item) => item.method !== 'GET' && !item.path.startsWith('/auth/'),
    )
    expect(writeApis.length).toBe(11)
    expect(writeApis.every((item) => item.permission.includes(':'))).toBe(true)
  })
})
