import { request } from './http'

import type { Role } from '@/types/rbac'

/** 新增角色参数 */
export interface RoleCreatePayload {
  code: string
  name: string
  description?: string
}

/** 编辑角色参数 */
export interface RoleUpdatePayload {
  name?: string
  description?: string
  status?: 0 | 1
}

/** 为角色分配权限参数 */
export interface RoleAssignPermissionsPayload {
  permissionIds: number[]
}

/** 角色模块 API（对齐 PRD 鉴权矩阵 7 条） */
export const roleApi = {
  /** GET /roles/search —— role:list */
  search: (keyword: string) => request.get<Role[]>('/roles/search', { keyword }),
  /** GET /roles —— role:list */
  list: () => request.get<Role[]>('/roles'),
  /** GET /roles/{role_id} —— role:read */
  getById: (id: number) => request.get<Role>(`/roles/${id}`),
  /** POST /roles —— role:create */
  create: (data: RoleCreatePayload) => request.post<Role>('/roles', data),
  /** PUT /roles/{role_id} —— role:update */
  update: (id: number, data: RoleUpdatePayload) => request.put<Role>(`/roles/${id}`, data),
  /** PUT /roles/{role_id}/permissions —— role:assign_permissions */
  assignPermissions: (id: number, data: RoleAssignPermissionsPayload) =>
    request.put<Role>(`/roles/${id}/permissions`, data),
  /** DELETE /roles/{role_id} —— role:delete */
  remove: (id: number) => request.delete<null>(`/roles/${id}`),
}
