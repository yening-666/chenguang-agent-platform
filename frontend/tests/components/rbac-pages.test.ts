// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { MOCK_ACCOUNTS } from '@/mock/accounts'
import ForbiddenPage from '@/pages/error/ForbiddenPage.vue'
import MenuPage from '@/pages/system/MenuPage.vue'
import PermissionPage from '@/pages/system/PermissionPage.vue'
import RolePage from '@/pages/system/RolePage.vue'
import { useAuthStore } from '@/store/modules/auth.store'

import { setupMockServer } from '../helpers/mock-server'

import type { Component } from 'vue'

const server = setupMockServer()

/** 以超管/普通用户身份挂载页面，等待 onMounted 的 mock 请求完成 */
async function mountPage(component: Component, path: string, accountIndex = 0) {
  const account = MOCK_ACCOUNTS[accountIndex]
  useAuthStore().setSession(account.token, account.user)

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: path.split('?')[0], component }],
  })
  await router.push(path)
  await router.isReady()

  const wrapper = mount(component, { global: { plugins: [server.pinia, router] } })
  await flushPromises()
  await flushPromises()
  return wrapper
}

describe('pages：RBAC 四个页面组件级 mock 测试', () => {
  it('RolePage：加载 3 个角色，超管可见「新增角色」按钮', async () => {
    const wrapper = await mountPage(RolePage, '/system/roles')
    expect(wrapper.text()).toContain('角色管理')
    expect(wrapper.findAll('tbody tr')).toHaveLength(3)
    expect(wrapper.text()).toContain('新增角色')
  })

  it('RolePage：普通用户无 role:create，写操作按钮被隐藏（FR-5）', async () => {
    const wrapper = await mountPage(RolePage, '/system/roles', 2)
    expect(wrapper.text()).not.toContain('新增角色')
    expect(wrapper.findAll('tbody tr')).toHaveLength(3)
  })

  it('PermissionPage：按 module 渲染 4 个分组、合计 10 条权限', async () => {
    const wrapper = await mountPage(PermissionPage, '/system/permissions')
    expect(wrapper.text()).toContain('权限管理')
    expect(wrapper.findAll('.perm-groups__group')).toHaveLength(4)
    expect(wrapper.findAll('tbody tr')).toHaveLength(10)
    expect(wrapper.text()).toContain('新增权限')
  })

  it('MenuPage：超管看到 8 条路由矩阵且全部可访问', async () => {
    const wrapper = await mountPage(MenuPage, '/system/menus')
    expect(wrapper.text()).toContain('菜单路由权限')
    expect(wrapper.findAll('tbody tr')).toHaveLength(8)
    expect(wrapper.text()).not.toContain('无权限（403）')
    expect(wrapper.findAll('.menus__perm').length).toBe(5)
  })

  it('MenuPage：普通用户 4 条受控路由显示「无权限（403）」', async () => {
    const wrapper = await mountPage(MenuPage, '/system/menus', 2)
    expect(wrapper.text()).toContain('访客账号')
    expect(wrapper.findAll('.menus__badge--off').length).toBeGreaterThanOrEqual(4)
    expect(wrapper.text()).toContain('无权限（403）')
  })

  it('ForbiddenPage：展示 403 与 URL 携带的缺失权限码', async () => {
    const wrapper = await mountPage(ForbiddenPage, '/403?perm=user:list')
    expect(wrapper.text()).toContain('403')
    expect(wrapper.text()).toContain('user:list')
  })
})
