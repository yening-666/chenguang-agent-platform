import { describe, expect, it } from 'vitest'

import { dashboardService } from '@/services/dashboard.service'
import { menuService } from '@/services/menu.service'
import { permissionService } from '@/services/permission.service'
import { roleService } from '@/services/role.service'
import { userService } from '@/services/user.service'

import { setupMockServer } from '../helpers/mock-server'

setupMockServer()

describe('services：RBAC 业务逻辑层全方法覆盖（mock 测试）', () => {
  it('userService.me / search / page / getById / getUserRoles', async () => {
    expect((await userService.me()).username).toBe('admin')
    expect((await userService.search('li'))[0].username).toBe('lisi')
    const page = await userService.page({ page: 0, pageSize: 10, keyword: '  admin  ' })
    expect(page.page).toBe(1)
    expect(page.list.some((u) => u.username === 'admin')).toBe(true)
    expect((await userService.getById(1)).nickname).toBe('超级管理员')
    expect((await userService.getUserRoles(1))[0].code).toBe('super_admin')
  })

  it('userService.create / update / assignRoles / remove', async () => {
    const created = await userService.create({ username: 'zhaoliu', nickname: '赵六' })
    expect(created.username).toBe('zhaoliu')
    expect((await userService.update(created.id, { status: 0 })).status).toBe(0)
    expect((await userService.assignRoles(created.id, { roleIds: [2] })).roles).toEqual(['系统管理员'])
    expect(await userService.remove(created.id)).toBeNull()
  })

  it('roleService.search / getRoles / getById / create / update / assignPermissions / remove', async () => {
    expect((await roleService.search('sys'))[0].code).toBe('sys_admin')
    expect((await roleService.getRoles()).map((r) => r.id)).toEqual([1, 2, 3])
    expect((await roleService.getById(1)).name).toBe('超级管理员')
    const created = await roleService.create({ code: 'auditor', name: '审计员' })
    expect((await roleService.update(created.id, { description: '只读' })).description).toBe('只读')
    expect((await roleService.assignPermissions(created.id, { permissionIds: [1, 2] })).permissionIds)
      .toEqual([1, 2])
    expect(await roleService.remove(created.id)).toBeNull()
  })

  it('permissionService.search / grouped / getById / create / update / remove', async () => {
    expect((await permissionService.search('role:')).length).toBe(3)
    expect((await permissionService.grouped()).map((p) => p.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect((await permissionService.getById(5)).code).toBe('user:assign_roles')
    const created = await permissionService.create({
      code: 'audit:list', name: '审计查询', module: 'audit', moduleName: '审计管理',
    })
    expect((await permissionService.update(created.id, { name: '审计查看' })).name).toBe('审计查看')
    expect(await permissionService.remove(created.id)).toBeNull()
  })

  it('menuService.getRoutes / dashboardService.getStats：返回矩阵与统计', async () => {
    expect((await menuService.getRoutes()).length).toBe(8)
    expect((await dashboardService.getStats()).userCount).toBe(5)
  })

  it('userService.page：参数规整（page 兜底 1、keyword 去空格）', async () => {
    const result = await userService.page({ page: -3, pageSize: 10, keyword: '   zhang ' })
    expect(result.page).toBe(1)
    expect(result.total).toBe(1)
  })
})
