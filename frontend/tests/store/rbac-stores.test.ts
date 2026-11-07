import { describe, expect, it } from 'vitest'

import { MOCK_ACCOUNTS } from '@/mock/accounts'
import { useAuthStore } from '@/store/modules/auth.store'
import { useMenuStore } from '@/store/modules/menu.store'
import { usePermissionStore } from '@/store/modules/permission.store'
import { useRoleStore } from '@/store/modules/role.store'
import { useUserStore } from '@/store/modules/user.store'

import { setupMockServer } from '../helpers/mock-server'

setupMockServer()

describe('store：RBAC 状态层全方法覆盖（mock 测试）', () => {
  it('userStore：fetchUsers / toggleStatus / assignRoles / createUser / removeUser', async () => {
    const store = useUserStore()
    await store.fetchUsers()
    expect(store.list).toHaveLength(5)
    expect(store.total).toBe(5)
    expect(store.loading).toBe(false)

    const target = store.list[1]
    await store.toggleStatus(target)
    expect(target.status).toBe(0)

    await store.createUser({ username: 'wangwu', nickname: '王五' })
    expect(store.total).toBe(6)

    await store.assignRoles(3, [1, 2])
    expect(store.list.find((u) => u.id === 3)?.roles).toEqual(['超级管理员', '系统管理员'])

    await store.removeUser(5)
    expect(store.total).toBe(5)
  })

  it('userStore：query 变更影响分页结果', async () => {
    const store = useUserStore()
    store.query = { page: 1, pageSize: 2, keyword: '' }
    await store.fetchUsers()
    expect(store.list.map((u) => u.id)).toEqual([1, 2])
    expect(store.total).toBe(5)
  })

  it('roleStore：fetchRoles / searchRoles / createRole / updateRole / assignPermissions / removeRole', async () => {
    const store = useRoleStore()
    await store.fetchRoles()
    expect(store.roles.map((r) => r.id)).toEqual([1, 2, 3])
    expect(store.loading).toBe(false)

    expect((await store.searchRoles('sys'))[0].code).toBe('sys_admin')
    await store.createRole({ code: 'auditor', name: '审计员' })
    expect(store.roles).toHaveLength(4)

    await store.updateRole(4, { description: '只读审计' })
    expect(store.roles.find((r) => r.id === 4)?.description).toBe('只读审计')

    await store.assignPermissions(4, [1, 2])
    expect(store.roles.find((r) => r.id === 4)?.permissionIds).toEqual([1, 2])

    await store.removeRole(4)
    expect(store.roles).toHaveLength(3)
  })

  it('permissionStore：fetchPermissions / groups 按 module 分组 / CRUD / search', async () => {
    const store = usePermissionStore()
    await store.fetchPermissions()
    expect(store.permissions).toHaveLength(10)
    expect(store.loading).toBe(false)
    expect(store.groups.map((g) => g.module)).toEqual(['dashboard', 'user', 'role', 'permission'])
    expect(store.groups.find((g) => g.module === 'user')?.items).toHaveLength(4)

    expect((await store.searchPermissions('user:')).length).toBe(4)
    await store.createPermission({
      code: 'audit:list', name: '审计查询', module: 'audit', moduleName: '审计管理', description: '',
    })
    expect(store.groups.map((g) => g.module)).toContain('audit')

    await store.updatePermission(11, { name: '审计查看' })
    expect(store.permissions.find((p) => p.id === 11)?.name).toBe('审计查看')

    await store.removePermission(11)
    expect(store.permissions).toHaveLength(10)
  })

  it('menuStore：fetchRoutes + matrix 按当前用户权限计算可访问性', async () => {
    const auth = useAuthStore()
    const store = useMenuStore()
    auth.setSession(MOCK_ACCOUNTS[0].token, MOCK_ACCOUNTS[0].user)
    await store.fetchRoutes()
    expect(store.routes).toHaveLength(8)
    expect(store.loading).toBe(false)
    // 超管 '*' → 全部可访问
    expect(store.matrix.every((row) => row.hasPermission)).toBe(true)
  })

  it('menuStore：普通用户仅可访问 dashboard:view 与无权限码路由', async () => {
    const auth = useAuthStore()
    const store = useMenuStore()
    auth.setSession(MOCK_ACCOUNTS[2].token, MOCK_ACCOUNTS[2].user)
    await store.fetchRoutes()
    const byPath = new Map(store.matrix.map((row) => [row.path, row.hasPermission]))
    expect(byPath.get('/dashboard')).toBe(true)
    expect(byPath.get('/system/users')).toBe(false)
    expect(byPath.get('/system/roles')).toBe(false)
    expect(byPath.get('/system/permissions')).toBe(false)
    expect(byPath.get('/403')).toBe(true)
  })
})
