import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { PermissionCreatePayload, PermissionUpdatePayload } from '@/apis/permission.api'
import { permissionService } from '@/services/permission.service'
import type { Permission } from '@/types/rbac'

/** 权限管理 store：列表 / 按模块分组视图 / 增删改 */
export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<Permission[]>([])
  const loading = ref(false)

  /** 按 module 分组视图（保持顺序） */
  const groups = computed(() => {
    const map = new Map<string, { moduleName: string; items: Permission[] }>()
    for (const item of permissions.value) {
      const group = map.get(item.module)
      if (group) {
        group.items.push(item)
      } else {
        map.set(item.module, { moduleName: item.moduleName, items: [item] })
      }
    }
    return [...map.entries()].map(([module, group]) => ({
      module,
      moduleName: group.moduleName,
      items: group.items,
    }))
  })

  /** 拉取权限列表 */
  async function fetchPermissions(): Promise<void> {
    loading.value = true
    try {
      permissions.value = await permissionService.grouped()
    } finally {
      loading.value = false
    }
  }

  /** 权限搜索（permission:list） */
  async function searchPermissions(keyword: string): Promise<Permission[]> {
    return permissionService.search(keyword)
  }

  /** 新增权限（permission:create） */
  async function createPermission(data: Omit<Permission, 'id' | 'status'>): Promise<void> {
    await permissionService.create(data)
    await fetchPermissions()
  }

  /** 编辑权限（permission:update） */
  async function updatePermission(id: number, data: PermissionUpdatePayload): Promise<void> {
    await permissionService.update(id, data)
    await fetchPermissions()
  }

  /** 删除权限（permission:delete） */
  async function removePermission(id: number): Promise<void> {
    await permissionService.remove(id)
    await fetchPermissions()
  }

  return {
    permissions,
    groups,
    loading,
    fetchPermissions,
    searchPermissions,
    createPermission,
    updatePermission,
    removePermission,
  }
})
