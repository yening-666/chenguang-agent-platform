import { request } from './http'

import type { PageQuery, PageResult } from '@/types/api'
import type { Role, UserInfo } from '@/types/rbac'

/** 用户分页查询参数 */
export interface UserPageQuery extends PageQuery {
  status?: 0 | 1
}

/** 新增用户参数 */
export interface UserCreatePayload {
  username: string
  nickname: string
}

/** 编辑用户参数 */
export interface UserUpdatePayload {
  nickname?: string
  status?: 0 | 1
}

/** 为用户分配角色参数 */
export interface UserAssignRolesPayload {
  roleIds: number[]
}

/** 用户模块 API（对齐 PRD 鉴权矩阵 8 条） */
export const userApi = {
  /** GET /users/me —— 登录即可 */
  me: () => request.get<UserInfo>('/users/me'),
  /** GET /users/search —— user:list */
  search: (keyword: string) => request.get<UserInfo[]>('/users/search', { keyword }),
  /** GET /users —— user:list */
  page: (params: UserPageQuery) => request.get<PageResult<UserInfo>>('/users', { ...params }),
  /** GET /users/{user_id} —— user:read */
  getById: (id: number) => request.get<UserInfo>(`/users/${id}`),
  /** GET /users/{user_id}/roles —— user:read */
  getRoles: (id: number) => request.get<Role[]>(`/users/${id}/roles`),
  /** POST /users —— user:create */
  create: (data: UserCreatePayload) => request.post<UserInfo>('/users', data),
  /** PUT /users/{user_id} —— user:update */
  update: (id: number, data: UserUpdatePayload) => request.put<UserInfo>(`/users/${id}`, data),
  /** PUT /users/{user_id}/roles —— user:assign_roles */
  assignRoles: (id: number, data: UserAssignRolesPayload) =>
    request.put<UserInfo>(`/users/${id}/roles`, data),
  /** DELETE /users/{user_id} —— user:delete */
  remove: (id: number) => request.delete<null>(`/users/${id}`),
}
