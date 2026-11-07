import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import http from '@/apis/http'
import { registerMockHandlers } from '@/mock/handlers'
import { createMockStore } from '@/mock/data'
import { permissionService } from '@/services/permission.service'

let mock: MockAdapter

beforeEach(() => {
  mock = new MockAdapter(http)
  registerMockHandlers(mock, createMockStore())
})

afterEach(() => {
  mock.restore()
})

describe('services/permission.service：权限业务逻辑（mock 测试）', () => {
  it('grouped：返回扁平列表且按 id 升序', async () => {
    const list = await permissionService.grouped()
    expect(list.length).toBe(10)
    expect(list[0].code).toBe('dashboard:view')
    expect(list.map((item) => item.id)).toEqual([...Array(10).keys()].map((n) => n + 1))
  })

  it('search：按关键字过滤权限码', async () => {
    const result = await permissionService.search('user:')
    expect(result.every((item) => item.code.startsWith('user:'))).toBe(true)
    expect(result.length).toBe(4)
  })

  it('search：空关键字返回空数组', async () => {
    expect(await permissionService.search('')).toEqual([])
  })
})
