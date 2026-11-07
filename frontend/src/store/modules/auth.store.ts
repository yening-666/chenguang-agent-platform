import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { authService } from '@/services/auth.service'
import { clearToken, getToken, setToken } from '@/utils/token'
import type { UserInfo } from '@/types/rbac'

/** 认证 store：token / 用户信息 / 权限集合 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(getToken() ?? '')
  const userInfo = ref<UserInfo | null>(null)

  /** 权限码集合（来自登录返回） */
  const permissions = computed(() => userInfo.value?.permissions ?? [])

  const isLoggedIn = computed(() => token.value !== '')

  /** 是否拥有指定权限；'*' 表示超级管理员全部权限 */
  function hasPermission(code: string): boolean {
    return permissions.value.includes('*') || permissions.value.includes(code)
  }

  /** 登录：调用认证服务，保存 token 与用户信息 */
  async function login(username: string, password: string): Promise<void> {
    const result = await authService.login(username, password)
    token.value = result.token
    userInfo.value = result.user
    setToken(result.token)
  }

  /** 写入会话（供路由守卫 mock 直登使用） */
  function setSession(nextToken: string, user: UserInfo): void {
    token.value = nextToken
    userInfo.value = user
    setToken(nextToken)
  }

  /** 退出登录：即使接口失败也清理本地会话 */
  async function logout(): Promise<void> {
    try {
      await authService.logout()
    } catch {
      /* 忽略登出接口错误 */
    }
    token.value = ''
    userInfo.value = null
    clearToken()
  }

  return { token, userInfo, permissions, isLoggedIn, hasPermission, login, logout, setSession }
})
