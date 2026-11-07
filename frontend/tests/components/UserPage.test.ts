// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'

import MockAdapter from 'axios-mock-adapter'

import http from '@/apis/http'
import { registerMockHandlers } from '@/mock/handlers'
import { createMockStore } from '@/mock/data'
import UserPage from '@/pages/system/UserPage.vue'
import { useAuthStore } from '@/store/modules/auth.store'
import { useUserStore } from '@/store/modules/user.store'

import type { Pinia } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', component: { template: '<div>layout</div>' }, children: [
    { path: 'system/users', component: UserPage },
  ] },
]

let mock: MockAdapter
let pinia: Pinia

async function mountPage(): Promise<ReturnType<typeof mount>> {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/system/users')
  const wrapper = mount(UserPage, { global: { plugins: [pinia, router] } })
  await router.isReady()
  await flushPromises()
  return wrapper
}

describe('pages/UserPage：用户列表页（mock 数据渲染）', () => {
  beforeEach(() => {
    // 组件内外使用同一个 pinia 实例，并注册 mock handler
    pinia = createPinia()
    setActivePinia(pinia)
    mock = new MockAdapter(http)
    registerMockHandlers(mock, createMockStore())
    const auth = useAuthStore()
    auth.setSession('mock-token-admin', {
      id: 1, username: 'admin', nickname: '超级管理员',
      roles: ['超级管理员'], permissions: ['*'], status: 1,
    })
  })

  it('挂载后自动拉取用户列表并渲染表格行', async () => {
    const wrapper = await mountPage()
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0].text()).toContain('admin')
  })

  it('无权限用户：新增用户按钮不渲染', async () => {
    const auth = useAuthStore()
    auth.setSession('mock-token-viewer', {
      id: 3, username: 'viewer', nickname: '访客账号',
      roles: ['普通用户'], permissions: ['dashboard:view'], status: 1,
    })
    const wrapper = await mountPage()
    const buttons = wrapper.findAll('button')
    const texts = buttons.map((button) => button.text())
    expect(texts).not.toContain('新增用户')
  })

  it('store 与页面联动：搜索关键字过滤列表', async () => {
    const userStore = useUserStore()
    userStore.query.keyword = 'lisi'
    void userStore.fetchUsers()
    await flushPromises()
    const wrapper = await mountPage()
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)
    expect(rows[0].text()).toContain('lisi')
  })
})
