import { request } from './http'

import type { Permission } from '@/types/rbac'

/** 新增权限参数 */
export interface PermissionCreatePayload {
  code: string
  name: string
  module: string
  moduleName: string
  description?: string
}

/** 编辑权限参数 */
export interface PermissionUpdatePayload {
  name?: string
  moduleName?: string
  description?: string
  status?: 0 | 1
}

/** 权限模块 API（对齐 PRD 鉴权矩阵 6 条） */
export const permissionApi = {
  /** GET /permissions/search —— permission:list */
  search: (keyword: string) => request.get<Permission[]>('/permissions/search', { keyword }),
  /** GET /permissions —— permission:list */
  list: () => request.get<Permission[]>('/permissions'),
  /** GET /permissions/{permission_id} —— permission:read */
  getById: (id: number) => request.get<Permission>(`/permissions/${id}`),
  /** POST /permissions —— permission:create */
  create: (data: PermissionCreatePayload) => request.post<Permission>('/permissions', data),
  /** PUT /permissions/{permission_id} —— permission:update */
  update: (id: number, data: PermissionUpdatePayload) =>
    request.put<Permission>(`/permissions/${id}`, data),
  /** DELETE /permissions/{permission_id} —— permission:delete */
  remove: (id: number) => request.delete<null>(`/permissions/${id}`),
}
