import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import http from '@/apis/http'
import { registerMockHandlers } from '@/mock/handlers'
import { createMockStore } from '@/mock/data'
import { userService } from '@/services/user.service'

let mock: MockAdapter

beforeEach(() => {
  mock = new MockAdapter(http)
  registerMockHandlers(mock, createMockStore())
})

afterEach(() => {
  mock.restore()
})

describe('services/user.service：用户业务逻辑（mock 测试）', () => {
  it('分页查询：返回 list 与 total', async () => {
    const result = await userService.page({ page: 1, pageSize: 2 })
    expect(result.list).toHaveLength(2)
    expect(result.total).toBe(5)
    expect(result.page).toBe(1)
  })

  it('分页查询：第二页返回剩余数据', async () => {
    const result = await userService.page({ page: 2, pageSize: 2 })
    expect(result.list).toHaveLength(2)
    expect(result.page).toBe(2)
  })

  it('参数规整：keyword 自动去空格', async () => {
    const result = await userService.page({ page: 1, pageSize: 10, keyword: '  lisi  ' })
    expect(result.total).toBe(1)
    expect(result.list[0].username).toBe('lisi')
  })

  it('参数规整：page < 1 兜底为 1', async () => {
    const result = await userService.page({ page: 0, pageSize: 10 })
    expect(result.page).toBe(1)
    expect(result.list).toHaveLength(5)
  })

  it('新增用户：用户名重复时报业务错误', async () => {
    const error = await userService
      .create({ username: 'admin', nickname: '重复名' })
      .catch((error: unknown) => error)
    expect((error as Error).message).toBe('用户名已存在')
  })

  it('状态切换：返回更新后的状态', async () => {
    const updated = await userService.update(5, { status: 1 })
    expect(updated.status).toBe(1)
  })
})
