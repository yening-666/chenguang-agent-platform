import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import http, { ApiError, request } from '@/apis/http'
import { clearToken, setToken } from '@/utils/token'

let mock: MockAdapter

beforeEach(() => {
  mock = new MockAdapter(http)
})

afterEach(() => {
  mock.restore()
  clearToken()
})

describe('apis/http：axios 封装层', () => {
  it('业务成功：自动解包 data', async () => {
    mock.onGet('/ping').reply(200, { code: 0, message: 'ok', data: { hello: 'world' } })
    const data = await request.get<{ hello: string }>('/ping')
    expect(data).toEqual({ hello: 'world' })
  })

  it('业务失败：code !== 0 抛出 ApiError 并携带 code/message', async () => {
    mock.onGet('/bad').reply(200, { code: 1001, message: '业务异常' })
    const error = await request.get('/bad').catch((error: unknown) => error)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe(1001)
    expect((error as ApiError).message).toBe('业务异常')
  })

  it('网络失败：HTTP 500 统一转换为 ApiError', async () => {
    mock.onGet('/boom').reply(500)
    const error = await request.get('/boom').catch((error: unknown) => error)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).message).not.toBe('')
  })

  it('请求拦截器：已登录时自动携带 Authorization', async () => {
    setToken('test-token')
    mock.onGet('/me').reply((config) => {
      return [200, { code: 0, message: 'ok', data: { authorization: config.headers?.Authorization } }]
    })
    const data = await request.get<{ authorization: string }>('/me')
    expect(data.authorization).toBe('Bearer test-token')
  })

  it('post/put/delete 请求出口可用', async () => {
    mock.onPost('/echo').reply(200, { code: 0, message: 'ok', data: 'posted' })
    mock.onPut('/echo').reply(200, { code: 0, message: 'ok', data: 'put' })
    mock.onDelete('/echo').reply(200, { code: 0, message: 'ok', data: 'deleted' })
    expect(await request.post<string>('/echo', { a: 1 })).toBe('posted')
    expect(await request.put<string>('/echo', { a: 2 })).toBe('put')
    expect(await request.delete<string>('/echo')).toBe('deleted')
  })
})
