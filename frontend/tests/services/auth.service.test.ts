import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import http from '@/apis/http'
import { registerMockHandlers } from '@/mock/handlers'
import { createMockStore } from '@/mock/data'
import { MOCK_ACCOUNTS } from '@/mock/accounts'
import { authService } from '@/services/auth.service'

let mock: MockAdapter

beforeEach(() => {
  mock = new MockAdapter(http)
  registerMockHandlers(mock, createMockStore())
})

afterEach(() => {
  mock.restore()
})

describe('services/auth.service：登录业务逻辑（mock 测试）', () => {
  it('登录成功：admin/123456 返回 token 与用户信息', async () => {
    const result = await authService.login('admin', '123456')
    expect(result.token).toBe(MOCK_ACCOUNTS[0].token)
    expect(result.user.username).toBe('admin')
    expect(result.user.permissions).toContain('*')
  })

  it('登录失败：密码错误返回业务错误', async () => {
    const error = await authService.login('admin', 'wrong-password').catch((error: unknown) => error)
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('用户名或密码错误')
  })

  it('参数校验：空用户名不发起请求直接报错', async () => {
    const error = await authService.login('   ', '123456').catch((error: unknown) => error)
    expect((error as Error).message).toBe('用户名不能为空')
    expect(mock.history.post).toHaveLength(0)
  })

  it('参数校验：空密码不发起请求直接报错', async () => {
    const error = await authService.login('admin', '').catch((error: unknown) => error)
    expect((error as Error).message).toBe('密码不能为空')
    expect(mock.history.post).toHaveLength(0)
  })
})
