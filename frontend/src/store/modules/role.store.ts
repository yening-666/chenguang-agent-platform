import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { RoleCreatePayload, RoleUpdatePayload } from '@/apis/role.api'
import { roleService } from '@/services/role.service'
import type { Role } from '@/types/rbac'

/** 角色管理 store：列表 / 增删改 / 分配权限 */
export const useRoleStore = defineStore('role', () => {
  const roles = ref<Role[]>([])
  const loading = ref(false)

  /** 拉取角色列表（按 id 升序） */
  async function fetchRoles(): Promise<void> {
    loading.value = true
    try {
      roles.value = await roleService.getRoles()
    } finally {
      loading.value = false
    }
  }

  /** 角色搜索（role:list） */
  async function searchRoles(keyword: string): Promise<Role[]> {
    return roleService.search(keyword)
  }

  /** 新增角色（role:create） */
  async function createRole(data: RoleCreatePayload): Promise<void> {
    await roleService.create(data)
    await fetchRoles()
  }

  /** 编辑角色（role:update） */
  async function updateRole(id: number, data: RoleUpdatePayload): Promise<void> {
    await roleService.update(id, data)
    await fetchRoles()
  }

  /** 为角色分配权限（role:assign_permissions） */
  async function assignPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    await roleService.assignPermissions(roleId, { permissionIds })
    await fetchRoles()
  }

  /** 删除角色（role:delete） */
  async function removeRole(id: number): Promise<void> {
    await roleService.remove(id)
    await fetchRoles()
  }

  return { roles, loading, fetchRoles, searchRoles, createRole, updateRole, assignPermissions, removeRole }
})
