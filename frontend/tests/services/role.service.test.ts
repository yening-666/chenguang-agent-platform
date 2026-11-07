import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import http from '@/apis/http'
import { roleService } from '@/services/role.service'

let mock: MockAdapter

beforeEach(() => {
  mock = new MockAdapter(http)
})

afterEach(() => {
  mock.restore()
})

describe('services/role.service：角色业务逻辑（mock 测试）', () => {
  it('角色列表：按 id 升序返回', async () => {
    mock.onGet('/roles').reply(
      200,
      { code: 0, message: 'ok', data: [
        { id: 3, code: 'user', name: '普通用户', description: '', userCount: 3, status: 1 },
        { id: 1, code: 'super_admin', name: '超级管理员', description: '', userCount: 1, status: 1 },
        { id: 2, code: 'sys_admin', name: '系统管理员', description: '', userCount: 1, status: 1 },
      ] },
    )
    const roles = await roleService.getRoles()
    expect(roles.map((role) => role.id)).toEqual([1, 2, 3])
  })

  it('角色列表：空列表返回空数组', async () => {
    mock.onGet('/roles').reply(200, { code: 0, message: 'ok', data: [] })
    expect(await roleService.getRoles()).toEqual([])
  })
})
