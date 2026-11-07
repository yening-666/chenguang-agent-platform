import MockAdapter from 'axios-mock-adapter'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach } from 'vitest'

import http from '@/apis/http'
import { registerMockHandlers } from '@/mock/handlers'
import { createMockStore } from '@/mock/data'
import { clearToken, setToken } from '@/utils/token'

import type { Pinia } from 'pinia'
import type { MockStore } from '@/mock/data'

/** 共享的 mock 服务端上下文：生产 mock 与测试共用同一份 handlers 路由表 */
export interface MockServer {
  mock: MockAdapter
  store: MockStore
  /** 当前用例的 Pinia 实例（组件挂载时须使用同一实例） */
  pinia: Pinia
}

/**
 * 安装测试基座：
 * - 每个用例独立 Pinia + 独立深拷贝数据仓库（零污染）
 * - onNoMatch=throwException：任何未被 mock 覆盖的接口会立刻暴露
 * - 默认以超级管理员身份登录（Bearer mock-token-admin）
 */
export function setupMockServer(): MockServer {
  const server = {
    mock: null as unknown as MockAdapter,
    store: createMockStore(),
    pinia: null as unknown as Pinia,
  } as MockServer

  beforeEach(() => {
    server.pinia = createPinia()
    setActivePinia(server.pinia)
    server.store = createMockStore()
    server.mock = new MockAdapter(http, { onNoMatch: 'throwException' })
    registerMockHandlers(server.mock, server.store)
    setToken('mock-token-admin')
  })

  afterEach(() => {
    server.mock.restore()
    clearToken()
  })

  return server
}

/** 以指定账号身份发起后续请求 */
export function loginAs(token: string): void {
  setToken(token)
}
