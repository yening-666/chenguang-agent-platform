// @vitest-environment jsdom
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { MOCK_ACCOUNTS } from '@/mock/accounts'
import { setupGuards } from '@/router/guards'
import { useAuthStore } from '@/store/modules/auth.store'

import type { RouteRecordRaw } from 'vue-router'

const Stub = { template: '<div>stub</div>' }

const testRoutes: RouteRecordRaw[] = [
  { path: '/login', component: Stub, meta: { title: '登录', requiresAuth: false } },
  {
    path: '/',
    component: Stub,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: Stub, meta: { title: '工作台', permission: 'dashboard:view' } },
      { path: 'system/users', component: Stub, meta: { title: '用户管理', permission: 'user:list' } },
      { path: 'system/roles', component: Stub, meta: { title: '角色管理', permission: 'role:list' } },
    ],
  },
  { path: '/403', component: Stub, meta: { title: '无权访问', requiresAuth: false } },
]

function makeRouter() {
  const router = createRouter({ history: createMemoryHistory(), routes: testRoutes })
  setupGuards(router)
  return router
}

function loginAs(index: number) {
  const account = MOCK_ACCOUNTS[index]
  useAuthStore().setSession(account.token, account.user)
}

beforeEach(() => {
  setActivePinia(createPinia())
  document.title = ''
})

describe('router/guards：登录态守卫 + 权限守卫（FR-3 / FR-5）', () => {
  it('未登录访问受保护页 → 跳转 /login 并携带 redirect', async () => {
    const router = makeRouter()
    await router.push('/system/users')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/system/users')
  })

  it('公开页 /login 无需登录即可访问', async () => {
    const router = makeRouter()
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('普通用户缺少 user:list → 跳转 /403 并携带缺失权限码', async () => {
    const router = makeRouter()
    loginAs(2)
    await router.push('/system/users')
    expect(router.currentRoute.value.path).toBe('/403')
    expect(router.currentRoute.value.query.perm).toBe('user:list')
  })

  it('系统管理员拥有 user:list / role:list → 用户页与角色页均放行', async () => {
    const router = makeRouter()
    loginAs(1)
    await router.push('/system/users')
    expect(router.currentRoute.value.path).toBe('/system/users')
    await router.push('/system/roles')
    expect(router.currentRoute.value.path).toBe('/system/roles')
  })

  it('普通用户缺少 role:list → 角色页跳转 /403 并携带 role:list', async () => {
    const router = makeRouter()
    loginAs(2)
    await router.push('/system/roles')
    expect(router.currentRoute.value.path).toBe('/403')
    expect(router.currentRoute.value.query.perm).toBe('role:list')
  })

  it('超级管理员 "*" 权限全部放行，且自动设置页面标题', async () => {
    const router = makeRouter()
    loginAs(0)
    await router.push('/system/roles')
    expect(router.currentRoute.value.path).toBe('/system/roles')
    expect(document.title).toBe('角色管理 · 晨光 Agent 平台')
  })

  it('未登录访问 /403 不被登录守卫拦截', async () => {
    const router = makeRouter()
    await router.push('/403')
    expect(router.currentRoute.value.path).toBe('/403')
  })
})
