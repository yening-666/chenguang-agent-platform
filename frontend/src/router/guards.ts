import type { Router } from 'vue-router'

import { MOCK_ACCOUNTS } from '@/mock/accounts'
import { useAuthStore } from '@/store/modules/auth.store'

export function setupGuards(router: Router): void {
  router.beforeEach((to) => {
    const auth = useAuthStore()

    document.title = to.meta.title ? `${to.meta.title} · 晨光 Agent 平台` : '晨光 Agent 平台'

    // —— 仅 mock 模式：支持 ?mockToken=xxx 直登，便于 E2E 演示 ——
    const mockToken = to.query.mockToken
    if (import.meta.env.VITE_USE_MOCK === 'true' && typeof mockToken === 'string' && mockToken) {
      const account = MOCK_ACCOUNTS.find((item) => item.token === mockToken)
      if (account) {
        auth.setSession(account.token, account.user)
        return { path: to.path, query: {} }
      }
    }

    // —— 登录态守卫：to.meta 由 matched 记录合并而来 ——
    if (to.meta.requiresAuth === true && !auth.isLoggedIn) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    // —— 权限守卫：无权限跳转 403 并携带缺失权限码 ——
    const permission = to.meta.permission
    if (permission && auth.isLoggedIn && !auth.hasPermission(permission)) {
      return { path: '/403', query: { perm: permission } }
    }

    return true
  })
}
