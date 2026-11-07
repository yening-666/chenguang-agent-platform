import { roleApi } from '@/apis/role.api'

import type { RoleAssignPermissionsPayload, RoleCreatePayload, RoleUpdatePayload } from '@/apis/role.api'
import type { Role } from '@/types/rbac'

/** 角色业务逻辑 */
export const roleService = {
  /** 角色搜索（GET /roles/search，role:list） */
  search(keyword: string): Promise<Role[]> {
    return roleApi.search(keyword)
  },

  /** 角色列表（按 id 升序） */
  async getRoles(): Promise<Role[]> {
    const roles = await roleApi.list()
    return [...roles].sort((a, b) => a.id - b.id)
  },

  /** 角色详情（GET /roles/{id}，role:read） */
  getById(id: number): Promise<Role> {
    return roleApi.getById(id)
  },

  /** 新增角色（POST /roles，role:create） */
  create(data: RoleCreatePayload): Promise<Role> {
    return roleApi.create(data)
  },

  /** 编辑角色（PUT /roles/{id}，role:update） */
  update(id: number, data: RoleUpdatePayload): Promise<Role> {
    return roleApi.update(id, data)
  },

  /** 为角色分配权限（PUT /roles/{id}/permissions，role:assign_permissions） */
  assignPermissions(id: number, payload: RoleAssignPermissionsPayload): Promise<Role> {
    return roleApi.assignPermissions(id, payload)
  },

  /** 删除角色（DELETE /roles/{id}，role:delete） */
  async remove(id: number): Promise<null> {
    return roleApi.remove(id)
  },
}
