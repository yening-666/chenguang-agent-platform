// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { MOCK_ACCOUNTS } from '@/mock/accounts'
import DashboardPage from '@/pages/dashboard/DashboardPage.vue'
import NotFoundPage from '@/pages/error/NotFoundPage.vue'
import LoginPage from '@/pages/login/LoginPage.vue'
import PermissionPage from '@/pages/system/PermissionPage.vue'
import RolePage from '@/pages/system/RolePage.vue'
import { useAuthStore } from '@/store/modules/auth.store'

import { setupMockServer } from '../helpers/mock-server'

import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

const server = setupMockServer()

const Stub = { template: '<div>stub</div>' }
const PATHS = [
  '/login', '/dashboard', '/system/users', '/system/roles',
  '/system/permissions', '/system/menus', '/403',
]
const routes: RouteRecordRaw[] = [
  ...PATHS.map((path) => ({ path, component: Stub })),
  { path: '/:pathMatch(.*)*', component: Stub },
]

async function mountAt(component: Component, path: string, accountIndex = 0) {
  const account = MOCK_ACCOUNTS[accountIndex]
  useAuthStore().setSession(account.token, account.user)

  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(component, { global: { plugins: [server.pinia, router] } })
  await flushPromises()
  await flushPromises()
  return { wrapper, router }
}

function buttonByText(wrapper: ReturnType<typeof mount>, text: string) {
  return wrapper.findAll('button').find((item) => item.text() === text)
}

describe('pages：RBAC 页面交互链路 mock 测试', () => {
  it('LoginPage：正确账号登录成功并跳转工作台', async () => {
    const { wrapper, router } = await mountAt(LoginPage, '/login')
    expect(wrapper.text()).toContain('RBAC 权限演示')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await flushPromises()
    expect(useAuthStore().isLoggedIn).toBe(true)
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('LoginPage：密码错误展示业务错误信息且不发生跳转', async () => {
    const { wrapper, router } = await mountAt(LoginPage, '/login')
    await wrapper.findAll('input')[1].setValue('wrong-password')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('用户名或密码错误')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('DashboardPage：渲染四张统计卡片，超管显示「全部权限」', async () => {
    const { wrapper } = await mountAt(DashboardPage, '/dashboard')
    expect(wrapper.findAll('.dashboard__card')).toHaveLength(4)
    expect(wrapper.text()).toContain('全部权限（超级管理员）')
    expect(wrapper.find('.dashboard__card-value').text()).toBe('5')
  })

  it('DashboardPage：普通用户按权限码逐个展示徽章', async () => {
    const { wrapper } = await mountAt(DashboardPage, '/dashboard', 2)
    expect(wrapper.text()).not.toContain('全部权限（超级管理员）')
    expect(wrapper.findAll('.dashboard__perm-badge').map((b) => b.text())).toEqual(['dashboard:view'])
  })

  it('NotFoundPage：展示 404', async () => {
    const { wrapper } = await mountAt(NotFoundPage, '/no-such-page')
    expect(wrapper.text()).toContain('404')
  })

  it('RolePage：新增角色弹窗 → 提交 → 列表出现 4 条', async () => {
    const { wrapper } = await mountAt(RolePage, '/system/roles')
    await buttonByText(wrapper, '新增角色')!.trigger('click')
    expect(wrapper.find('.dialog-mask').exists()).toBe(true)

    const inputs = wrapper.findAll('.dialog__field input')
    await inputs[0].setValue('auditor')
    await inputs[1].setValue('审计员')
    await inputs[2].setValue('只读审计')
    await buttonByText(wrapper, '确认')!.trigger('click')
    await flushPromises()
    await flushPromises()

    expect(wrapper.find('.dialog-mask').exists()).toBe(false)
    expect(wrapper.findAll('tbody tr')).toHaveLength(4)
    expect(wrapper.text()).toContain('审计员')
  })

  it('RolePage：分配权限弹窗按 module 分组 → 勾选 → 确认分配', async () => {
    const { wrapper } = await mountAt(RolePage, '/system/roles')
    await buttonByText(wrapper, '分配权限')!.trigger('click')
    expect(wrapper.findAll('.dialog__group')).toHaveLength(4)

    const checkboxes = wrapper.findAll('.dialog__option input')
    await checkboxes[0].setValue(true)
    await buttonByText(wrapper, '确认分配')!.trigger('click')
    await flushPromises()
    await flushPromises()

    expect(wrapper.find('.dialog-mask').exists()).toBe(false)
    expect(server.store.roles[0].permissionIds).toEqual([1])
  })

  it('PermissionPage：新增权限弹窗 → 提交 → 分组与总数更新', async () => {
    const { wrapper } = await mountAt(PermissionPage, '/system/permissions')
    await buttonByText(wrapper, '新增权限')!.trigger('click')

    const inputs = wrapper.findAll('.dialog__field input')
    await inputs[0].setValue('audit:list')
    await inputs[1].setValue('审计查询')
    await inputs[2].setValue('audit')
    await inputs[3].setValue('审计管理')
    await inputs[4].setValue('只读审计')
    await buttonByText(wrapper, '确认')!.trigger('click')
    await flushPromises()
    await flushPromises()

    expect(wrapper.findAll('.perm-groups__group')).toHaveLength(5)
    expect(wrapper.findAll('tbody tr')).toHaveLength(11)
    expect(wrapper.text()).toContain('audit:list')
  })
})
