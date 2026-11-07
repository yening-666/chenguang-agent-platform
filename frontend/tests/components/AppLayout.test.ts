// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'

import AppLayout from '@/components/layout/AppLayout.vue'
import { useAuthStore } from '@/store/modules/auth.store'

import type { Pinia } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

const Stub = { template: '<div>stub</div>' }

const routes: RouteRecordRaw[] = [
  // AppLayout 不作为路由组件（避免 RouterView 嵌套渲染两份菜单），仅注册子页面路由；
  // 需覆盖侧边栏全部链接，避免 RouterLink 产生 "No match found" 警告
  { path: '/dashboard', component: Stub },
  { path: '/system/users', component: Stub },
  { path: '/system/roles', component: Stub },
  { path: '/system/permissions', component: Stub },
  { path: '/system/menus', component: Stub },
]

let pinia: Pinia

async function mountLayout(): Promise<ReturnType<typeof mount>> {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/dashboard')
  const wrapper = mount(AppLayout, { global: { plugins: [pinia, router] } })
  await router.isReady()
  return wrapper
}

describe('components/AppLayout：侧边栏菜单按权限过滤', () => {
  beforeEach(() => {
    // 组件内外使用同一个 pinia 实例
    pinia = createPinia()
    setActivePinia(pinia)
    document.title = ''
  })

  it('超级管理员：全部菜单可见', async () => {
    const auth = useAuthStore()
    auth.setSession('mock-token-admin', {
      id: 1, username: 'admin', nickname: '超级管理员',
      roles: ['超级管理员'], permissions: ['*'], status: 1,
    })
    const wrapper = await mountLayout()
    const items = wrapper.findAll('.app-layout__menu-item')
    expect(items).toHaveLength(5)
    expect(items[0].text()).toContain('工作台')
    expect(items[4].text()).toContain('菜单路由权限')
  })

  it('系统管理员：五个菜单均可见（含本清单全部权限码）', async () => {
    const auth = useAuthStore()
    auth.setSession('mock-token-sysadmin', {
      id: 2, username: 'sysadmin', nickname: '系统管理员',
      roles: ['系统管理员'],
      permissions: ['dashboard:view', 'user:list', 'user:create', 'role:list', 'permission:list'],
      status: 1,
    })
    const wrapper = await mountLayout()
    const items = wrapper.findAll('.app-layout__menu-item')
    expect(items).toHaveLength(5)
  })

  it('访客账号：仅工作台菜单可见', async () => {
    const auth = useAuthStore()
    auth.setSession('mock-token-viewer', {
      id: 3, username: 'viewer', nickname: '访客账号',
      roles: ['普通用户'], permissions: ['dashboard:view'], status: 1,
    })
    const wrapper = await mountLayout()
    const items = wrapper.findAll('.app-layout__menu-item')
    expect(items).toHaveLength(1)
    expect(items[0].text()).toContain('工作台')
  })

  it('头部展示当前用户昵称', async () => {
    const auth = useAuthStore()
    auth.setSession('mock-token-admin', {
      id: 1, username: 'admin', nickname: '超级管理员',
      roles: ['超级管理员'], permissions: ['*'], status: 1,
    })
    const wrapper = await mountLayout()
    expect(wrapper.find('.app-layout__welcome').text()).toContain('超级管理员')
  })
})
