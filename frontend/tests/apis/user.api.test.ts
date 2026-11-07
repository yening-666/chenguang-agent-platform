import { describe, expect, it } from 'vitest'

import { ApiError } from '@/apis/http'
import { userApi } from '@/apis/user.api'
import { MOCK_ACCOUNTS, MOCK_ERROR_CODES } from '@/mock/accounts'

import { setupMockServer } from '../helpers/mock-server'

const server = setupMockServer()

describe('apis/user.api：用户模块接口（9 条，PRD 鉴权矩阵）', () => {
  it('GET /users/me：返回当前登录用户', async () => {
    const user = await userApi.me()
    expect(user.username).toBe('admin')
  })

  it('GET /users/search：按用户名/昵称模糊匹配', async () => {
    const result = await userApi.search('admin')
    expect(result.map((u) => u.username)).toEqual(expect.arrayContaining(['admin', 'sysadmin']))
    expect(result.every((u) => u.username.includes('admin') || u.nickname.includes('admin'))).toBe(true)
  })

  it('GET /users/search：空关键字返回空数组', async () => {
    expect(await userApi.search('')).toEqual([])
  })

  it('GET /users：分页返回 list/total/page/pageSize', async () => {
    const result = await userApi.page({ page: 1, pageSize: 2 })
    expect(result.list).toHaveLength(2)
    expect(result.total).toBe(5)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(2)
  })

  it('GET /users：keyword 过滤 + 第二页边界', async () => {
    const filtered = await userApi.page({ page: 1, pageSize: 10, keyword: 'zhang' })
    expect(filtered.total).toBe(1)
    expect(filtered.list[0].username).toBe('zhangsan')
    const second = await userApi.page({ page: 2, pageSize: 2 })
    expect(second.list.map((u) => u.id)).toEqual([3, 4])
  })

  it('GET /users/{id}：返回用户详情；不存在时 1005', async () => {
    expect((await userApi.getById(1)).username).toBe('admin')
    const error = await userApi.getById(999).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe(MOCK_ERROR_CODES.NOT_FOUND)
  })

  it('GET /users/{id}/roles：返回该用户已分配角色', async () => {
    const roles = await userApi.getRoles(1)
    expect(roles.map((role) => role.code)).toEqual(['super_admin'])
    expect(await userApi.getRoles(3)).toHaveLength(1)
  })

  it('POST /users：创建用户并写入仓库；重名返回 1002', async () => {
    const created = await userApi.create({ username: 'wangwu', nickname: '王五' })
    expect(created.username).toBe('wangwu')
    expect(created.roles).toEqual(['普通用户'])
    expect(server.store.users).toHaveLength(6)

    const error = await userApi.create({ username: 'wangwu', nickname: '王五' }).catch((e: unknown) => e)
    expect((error as ApiError).code).toBe(MOCK_ERROR_CODES.USERNAME_DUPLICATED)
  })

  it('PUT /users/{id}：编辑昵称与状态', async () => {
    const updated = await userApi.update(2, { nickname: '系统管理员A', status: 0 })
    expect(updated.nickname).toBe('系统管理员A')
    expect(updated.status).toBe(0)
  })

  it('PUT /users/{id}/roles：分配角色后同步用户角色名', async () => {
    const updated = await userApi.assignRoles(3, { roleIds: [1, 2] })
    expect(updated.roles).toEqual(['超级管理员', '系统管理员'])
  })

  it('DELETE /users/{id}：删除成功；重复删除返回 1005', async () => {
    expect(await userApi.remove(5)).toBeNull()
    expect(server.store.users).toHaveLength(4)
    const error = await userApi.remove(5).catch((e: unknown) => e)
    expect((error as ApiError).code).toBe(MOCK_ERROR_CODES.NOT_FOUND)
  })

  it('数据隔离：每个用例的仓库均从 5 个初始用户开始', () => {
    expect(server.store.users).toHaveLength(5)
    expect(server.store.users[0]).toEqual(MOCK_ACCOUNTS[0].user)
  })
})
