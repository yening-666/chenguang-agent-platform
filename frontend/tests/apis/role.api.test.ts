import { describe, expect, it } from 'vitest'

import { ApiError } from '@/apis/http'
import { roleApi } from '@/apis/role.api'
import { MOCK_ERROR_CODES } from '@/mock/accounts'

import { setupMockServer } from '../helpers/mock-server'

const server = setupMockServer()

describe('apis/role.api：角色模块接口（7 条，PRD 鉴权矩阵）', () => {
  it('GET /roles/search：按名称/编码模糊匹配，空关键字返回空数组', async () => {
    const result = await roleApi.search('admin')
    expect(result.map((r) => r.code)).toEqual(expect.arrayContaining(['super_admin', 'sys_admin']))
    expect(await roleApi.search('')).toEqual([])
  })

  it('GET /roles：返回全部角色', async () => {
    const roles = await roleApi.list()
    expect(roles).toHaveLength(3)
    expect(roles.map((r) => r.code)).toEqual(['super_admin', 'sys_admin', 'user'])
  })

  it('GET /roles/{id}：返回详情；不存在返回 1005', async () => {
    expect((await roleApi.getById(2)).name).toBe('系统管理员')
    const error = await roleApi.getById(999).catch((e: unknown) => e)
    expect((error as ApiError).code).toBe(MOCK_ERROR_CODES.NOT_FOUND)
  })

  it('POST /roles：创建角色；编码重复返回 1003', async () => {
    const created = await roleApi.create({ code: 'auditor', name: '审计员', description: '只读审计' })
    expect(created.code).toBe('auditor')
    expect(created.userCount).toBe(0)
    expect(created.status).toBe(1)
    expect(server.store.roles).toHaveLength(4)

    const error = await roleApi.create({ code: 'auditor', name: '审计员2' }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe(MOCK_ERROR_CODES.ROLE_CODE_DUPLICATED)
  })

  it('PUT /roles/{id}：编辑名称、描述与状态', async () => {
    const updated = await roleApi.update(2, { name: '系统管理员B', status: 0 })
    expect(updated.name).toBe('系统管理员B')
    expect(updated.status).toBe(0)
  })

  it('PUT /roles/{id}/permissions：分配权限 ID 列表（FR-7 核心）', async () => {
    const updated = await roleApi.assignPermissions(2, { permissionIds: [1, 2, 6] })
    expect(updated.permissionIds).toEqual([1, 2, 6])
    expect(server.store.roles.find((r) => r.id === 2)?.permissionIds).toEqual([1, 2, 6])
  })

  it('DELETE /roles/{id}：删除成功；重复删除返回 1005', async () => {
    expect(await roleApi.remove(3)).toBeNull()
    expect(server.store.roles).toHaveLength(2)
    const error = await roleApi.remove(3).catch((e: unknown) => e)
    expect((error as ApiError).code).toBe(MOCK_ERROR_CODES.NOT_FOUND)
  })
})
