import MockAdapter from 'axios-mock-adapter'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import http from '@/apis/http'
import { MOCK_ACCOUNTS } from '@/mock/accounts'
import { useAuthStore } from '@/store/modules/auth.store'

let mock: MockAdapter

beforeEach(() => {
  setActivePinia(createPinia())
  mock = new MockAdapter(http)
})

afterEach(() => {
  mock.restore()
})

describe('store/auth：认证 store（mock 测试）', () => {
  it('login 成功：保存 token 与用户信息，isLoggedIn 为 true', async () => {
    const auth = useAuthStore()
    mock.onPost('/auth/login').reply(
      200,
      { code: 0, message: 'ok', data: { token: 't-1', user: MOCK_ACCOUNTS[0].user } },
    )
    await auth.login('admin', '123456')
    expect(auth.isLoggedIn).toBe(true)
    expect(auth.token).toBe('t-1')
    expect(auth.userInfo?.username).toBe('admin')
  })

  it('hasPermission：超管(*) 拥有全部权限', async () => {
    const auth = useAuthStore()
    mock.onPost('/auth/login').reply(
      200,
      { code: 0, message: 'ok', data: { token: 't-2', user: MOCK_ACCOUNTS[0].user } },
    )
    await auth.login('admin', '123456')
    expect(auth.hasPermission('user:list')).toBe(true)
    expect(auth.hasPermission('anything:else')).toBe(true)
  })

  it('hasPermission：普通用户仅拥有已授权权限', async () => {
    const auth = useAuthStore()
    mock.onPost('/auth/login').reply(
      200,
      { code: 0, message: 'ok', data: { token: 't-3', user: MOCK_ACCOUNTS[2].user } },
    )
    await auth.login('viewer', '123456')
    expect(auth.hasPermission('dashboard:view')).toBe(true)
    expect(auth.hasPermission('user:list')).toBe(false)
  })

  it('logout：清空 token 与用户信息', async () => {
    const auth = useAuthStore()
    mock.onPost('/auth/login').reply(
      200,
      { code: 0, message: 'ok', data: { token: 't-4', user: MOCK_ACCOUNTS[0].user } },
    )
    mock.onPost('/auth/logout').reply(200, { code: 0, message: 'ok', data: null })
    await auth.login('admin', '123456')
    await auth.logout()
    expect(auth.isLoggedIn).toBe(false)
    expect(auth.token).toBe('')
    expect(auth.userInfo).toBeNull()
  })

  it('setSession：直接写入会话（路由守卫 mock 直登用）', async () => {
    const auth = useAuthStore()
    auth.setSession('mock-token-x', MOCK_ACCOUNTS[1].user)
    expect(auth.isLoggedIn).toBe(true)
    expect(auth.userInfo?.username).toBe(MOCK_ACCOUNTS[1].username)
  })
})
