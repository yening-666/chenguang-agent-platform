import { describe, expect, it } from 'vitest'

import { ApiError } from '@/apis/http'
import { authApi } from '@/apis/auth.api'
import { MOCK_ACCOUNTS, MOCK_ERROR_CODES } from '@/mock/accounts'
import { clearToken } from '@/utils/token'

import { setupMockServer } from '../helpers/mock-server'

setupMockServer()

describe('apis/auth.api：认证接口（3 条）', () => {
  it('POST /auth/login：正确账号返回 token 与用户信息', async () => {
    const result = await authApi.login('admin', '123456')
    expect(result.token).toBe('mock-token-admin')
    expect(result.user.username).toBe('admin')
    expect(result.user.permissions).toContain('*')
  })

  it('POST /auth/login：密码错误抛出业务异常 1001', async () => {
    const error = await authApi.login('admin', 'wrong').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe(MOCK_ERROR_CODES.LOGIN_FAILED)
    expect((error as ApiError).message).toBe('用户名或密码错误')
  })

  it('POST /auth/login：不存在的用户同样返回 1001（不泄漏账号信息）', async () => {
    const error = await authApi.login('ghost', '123456').catch((e: unknown) => e)
    expect((error as ApiError).code).toBe(MOCK_ERROR_CODES.LOGIN_FAILED)
  })

  it('POST /auth/logout：返回 null', async () => {
    expect(await authApi.logout()).toBeNull()
  })

  it('GET /auth/profile：携带有效 token 返回当前用户', async () => {
    const user = await authApi.profile()
    expect(user).toEqual(MOCK_ACCOUNTS[0].user)
  })

  it('GET /auth/profile：未登录返回 401', async () => {
    clearToken()
    const error = await authApi.profile().catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe(401)
  })
})
