import { describe, expect, it } from 'vitest'

import { ApiError } from '@/apis/http'
import { permissionApi } from '@/apis/permission.api'
import { MOCK_ERROR_CODES } from '@/mock/accounts'

import { setupMockServer } from '../helpers/mock-server'

const server = setupMockServer()

describe('apis/permission.api：权限模块接口（6 条，PRD 鉴权矩阵）', () => {
  it('GET /permissions/search：按权限码/名称模糊匹配，空关键字返回空数组', async () => {
    const result = await permissionApi.search('user:')
    expect(result).toHaveLength(4)
    expect(result.every((p) => p.code.startsWith('user:'))).toBe(true)
    expect(await permissionApi.search('')).toEqual([])
  })

  it('GET /permissions：返回扁平权限表，权限码遵循「模块:操作」规范', async () => {
    const list = await permissionApi.list()
    expect(list).toHaveLength(10)
    expect(list.every((p) => /^[a-z_]+:[a-z_]+$/.test(p.code))).toBe(true)
    expect(list.every((p) => p.module !== '' && p.moduleName !== '')).toBe(true)
  })

  it('GET /permissions/{id}：返回详情；不存在返回 1005', async () => {
    expect((await permissionApi.getById(2)).code).toBe('user:list')
    const error = await permissionApi.getById(999).catch((e: unknown) => e)
    expect((error as ApiError).code).toBe(MOCK_ERROR_CODES.NOT_FOUND)
  })

  it('POST /permissions：创建权限；权限码重复返回 1004', async () => {
    const created = await permissionApi.create({
      code: 'audit:list', name: '审计查询', module: 'audit', moduleName: '审计管理',
    })
    expect(created.code).toBe('audit:list')
    expect(created.status).toBe(1)
    expect(server.store.permissions).toHaveLength(11)

    const error = await permissionApi.create({
      code: 'audit:list', name: '审计查询2', module: 'audit', moduleName: '审计管理',
    }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe(MOCK_ERROR_CODES.PERMISSION_CODE_DUPLICATED)
  })

  it('PUT /permissions/{id}：编辑名称与状态', async () => {
    const updated = await permissionApi.update(3, { name: '用户创建A', status: 0 })
    expect(updated.name).toBe('用户创建A')
    expect(updated.status).toBe(0)
  })

  it('DELETE /permissions/{id}：删除成功；重复删除返回 1005', async () => {
    expect(await permissionApi.remove(10)).toBeNull()
    expect(server.store.permissions).toHaveLength(9)
    const error = await permissionApi.remove(10).catch((e: unknown) => e)
    expect((error as ApiError).code).toBe(MOCK_ERROR_CODES.NOT_FOUND)
  })
})
