import { permissionApi } from '@/apis/permission.api'

import type { PermissionCreatePayload, PermissionUpdatePayload } from '@/apis/permission.api'
import type { Permission } from '@/types/rbac'

/** 权限业务逻辑 */
export const permissionService = {
  /** 权限搜索（GET /permissions/search，permission:list） */
  search(keyword: string): Promise<Permission[]> {
    return permissionApi.search(keyword)
  },

  /** 查询权限列表并按 module 分组（保持后端返回顺序，与 PRD「扁平权限表 + module 分组字段」对齐） */
  async grouped(): Promise<Permission[]> {
    const list = await permissionApi.list()
    return [...list].sort((a, b) => a.id - b.id)
  },

  /** 权限详情（GET /permissions/{id}，permission:read） */
  getById(id: number): Promise<Permission> {
    return permissionApi.getById(id)
  },

  /** 新增权限（POST /permissions，permission:create） */
  create(data: PermissionCreatePayload): Promise<Permission> {
    return permissionApi.create(data)
  },

  /** 编辑权限（PUT /permissions/{id}，permission:update） */
  update(id: number, data: PermissionUpdatePayload): Promise<Permission> {
    return permissionApi.update(id, data)
  },

  /** 删除权限（DELETE /permissions/{id}，permission:delete） */
  async remove(id: number): Promise<null> {
    return permissionApi.remove(id)
  },
}
