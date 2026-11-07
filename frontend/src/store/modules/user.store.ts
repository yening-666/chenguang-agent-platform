import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { UserPageQuery } from '@/apis/user.api'
import { userService } from '@/services/user.service'
import type { UserInfo } from '@/types/rbac'

/** 用户列表 store：查询参数 / 列表数据 / 加载状态 */
export const useUserStore = defineStore('user', () => {
  const list = ref<UserInfo[]>([])
  const total = ref(0)
  const loading = ref(false)
  const query = ref<UserPageQuery>({ page: 1, pageSize: 10, keyword: '' })

  /** 拉取用户列表 */
  async function fetchUsers(): Promise<void> {
    loading.value = true
    try {
      const result = await userService.page(query.value)
      list.value = result.list
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  /** 切换用户状态（user:update） */
  async function toggleStatus(user: UserInfo): Promise<void> {
    const next: 0 | 1 = user.status === 1 ? 0 : 1
    const updated = await userService.update(user.id, { status: next })
    user.status = updated.status
  }

  /** 为用户分配角色（user:assign_roles） */
  async function assignRoles(userId: number, roleIds: number[]): Promise<void> {
    await userService.assignRoles(userId, { roleIds })
    await fetchUsers()
  }

  /** 删除用户（user:delete） */
  async function removeUser(userId: number): Promise<void> {
    await userService.remove(userId)
    await fetchUsers()
  }

  /** 新增用户（user:create） */
  async function createUser(data: { username: string; nickname: string }): Promise<void> {
    await userService.create(data)
    await fetchUsers()
  }

  return { list, total, loading, query, fetchUsers, toggleStatus, assignRoles, removeUser, createUser }
})
