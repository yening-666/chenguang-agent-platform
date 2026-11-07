import { userApi } from '@/apis/user.api'

import type { UserAssignRolesPayload, UserCreatePayload, UserPageQuery, UserUpdatePayload } from '@/apis/user.api'
import type { PageResult } from '@/types/api'
import type { Role, UserInfo } from '@/types/rbac'

/** 用户业务逻辑：参数规整 → 调用用户 API */
export const userService = {
  /** 当前登录用户信息（GET /users/me，登录即可） */
  me(): Promise<UserInfo> {
    return userApi.me()
  },

  /** 用户搜索（GET /users/search，user:list） */
  search(keyword: string): Promise<UserInfo[]> {
    return userApi.search(keyword)
  },

  /** 分页查询用户列表；keyword 去空格、page 兜底为 1 */
  async page(query: UserPageQuery): Promise<PageResult<UserInfo>> {
    const params: UserPageQuery = { ...query }
    if (params.keyword) {
      params.keyword = params.keyword.trim()
    }
    if (!params.page || params.page < 1) {
      params.page = 1
    }
    return userApi.page(params)
  },

  /** 用户详情（GET /users/{id}，user:read） */
  getById(id: number): Promise<UserInfo> {
    return userApi.getById(id)
  },

  /** 用户已分配角色（GET /users/{id}/roles，user:read） */
  getUserRoles(id: number): Promise<Role[]> {
    return userApi.getRoles(id)
  },

  /** 新增用户（POST /users，user:create） */
  create(data: UserCreatePayload): Promise<UserInfo> {
    return userApi.create(data)
  },

  /** 编辑用户（PUT /users/{id}，user:update） */
  update(id: number, data: UserUpdatePayload): Promise<UserInfo> {
    return userApi.update(id, data)
  },

  /** 为用户分配角色（PUT /users/{id}/roles，user:assign_roles） */
  async assignRoles(id: number, payload: UserAssignRolesPayload): Promise<UserInfo> {
    return userApi.assignRoles(id, payload)
  },

  /** 删除用户（DELETE /users/{id}，user:delete） */
  async remove(id: number): Promise<null> {
    return userApi.remove(id)
  },
}
