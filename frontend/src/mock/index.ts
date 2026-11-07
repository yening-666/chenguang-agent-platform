import MockAdapter from 'axios-mock-adapter'

import http from '@/apis/http'

import { registerMockHandlers } from './handlers'
import { createMockStore } from './data'

let installed = false

/** 安装 mock 拦截器（幂等；仅当 VITE_USE_MOCK=true 时生效） */
export function setupMock(): void {
  if (installed) return
  if (import.meta.env.VITE_USE_MOCK !== 'true') return
  installed = true

  const mock = new MockAdapter(http, { onNoMatch: 'throwException' })
  registerMockHandlers(mock, createMockStore())
}
