import { authApi } from '@/apis/auth.api'

import type { LoginResult } from '@/types/rbac'

/** 认证业务逻辑：参数校验 → 调用认证 API */
export const authService = {
  /** 登录：校验参数后调用认证接口，返回 token 与用户信息 */
  async login(username: string, password: string): Promise<LoginResult> {
    if (!username.trim()) {
      throw new Error('用户名不能为空')
    }
    if (!password) {
      throw new Error('密码不能为空')
    }
    return authApi.login(username.trim(), password)
  },

  /** 退出登录 */
  logout(): Promise<null> {
    return authApi.logout()
  },

  /** 获取当前登录用户信息 */
  profile() {
    return authApi.profile()
  },
}
