import { request } from './http'

import type { LoginResult, UserInfo } from '@/types/rbac'

/** 认证模块 API */
export const authApi = {
  login: (username: string, password: string) =>
    request.post<LoginResult>('/auth/login', { username, password }),
  logout: () => request.post<null>('/auth/logout'),
  profile: () => request.get<UserInfo>('/auth/profile'),
}
