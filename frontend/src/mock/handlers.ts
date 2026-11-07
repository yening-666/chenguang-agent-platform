import MockAdapter from 'axios-mock-adapter'

import type { ApiResponse } from '@/types/api'
import type { Role, UserInfo } from '@/types/rbac'

import { MOCK_ACCOUNTS, MOCK_ERROR_CODES } from './accounts'
import type { MockStore } from './data'
import { mockMenuRoutes } from './data'

type ReplyBody<T> = [number, ApiResponse<T>]

function ok<T>(data: T) {
  return (): ReplyBody<T> => [200, { code: 0, message: 'ok', data }]
}

function fail<T>(code: number, message: string) {
  return (): ReplyBody<T> => [200, { code, message, data: null as T }]
}

function currentAccount(config: { headers?: unknown }) {
  const headers = config.headers as Record<string, unknown> | undefined
  const authorization = headers?.Authorization
  return MOCK_ACCOUNTS.find((item) => `Bearer ${item.token}` === authorization)
}

/** 注册全部业务接口的 mock handler（生产 mock 与单测共用同一路由表） */
export function registerMockHandlers(mock: MockAdapter, store: MockStore): void {
  // ============ 认证（公开接口） ============
  mock.onPost('/auth/login').reply((config) => {
    const { username, password } = JSON.parse(config.data as string) as {
      username: string
      password: string
    }
    const account = MOCK_ACCOUNTS.find((item) => item.username === username)
    if (!account || account.password !== password) {
      return fail(MOCK_ERROR_CODES.LOGIN_FAILED, '用户名或密码错误')()
    }
    return ok({ token: account.token, user: account.user })()
  })

  mock.onPost('/auth/logout').reply(ok<null>(null))

  mock.onGet('/auth/profile').reply((config) => {
    const account = currentAccount(config)
    if (!account) return fail<UserInfo>(401, '登录已过期')()
    return ok(account.user)()
  })

  // ============ 用户（8 条，PRD 鉴权矩阵） ============
  mock.onGet('/users/me').reply((config) => {
    const account = currentAccount(config)
    if (!account) return fail<UserInfo>(401, '登录已过期')()
    return ok(account.user)()
  })

  mock.onGet('/users/search').reply((config) => {
    const keyword = String(config.params?.keyword ?? '').trim()
    if (!keyword) return ok<UserInfo[]>([])()
    return ok(
      store.users.filter(
        (user) => user.username.includes(keyword) || user.nickname.includes(keyword),
      ),
    )()
  })

  mock.onGet(/\/users$/).reply((config) => {
    const page = Number(config.params?.page ?? 1)
    const pageSize = Number(config.params?.pageSize ?? 10)
    const keyword = String(config.params?.keyword ?? '').trim()

    const filtered = keyword
      ? store.users.filter(
          (user) => user.username.includes(keyword) || user.nickname.includes(keyword),
        )
      : store.users

    const start = (page - 1) * pageSize
    return ok({
      list: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    })()
  })

  mock.onGet(/\/users\/\d+$/).reply((config) => {
    const id = Number(config.url?.match(/\/users\/(\d+)$/)?.[1])
    const user = store.users.find((item) => item.id === id)
    if (!user) return fail<UserInfo>(MOCK_ERROR_CODES.NOT_FOUND, '用户不存在')()
    return ok(user)()
  })

  mock.onGet(/\/users\/\d+\/roles$/).reply((config) => {
    const id = Number(config.url?.match(/\/users\/(\d+)\/roles$/)?.[1])
    const user = store.users.find((item) => item.id === id)
    if (!user) return fail<Role[]>(MOCK_ERROR_CODES.NOT_FOUND, '用户不存在')()
    return ok(store.roles.filter((role) => user.roles.includes(role.name)))()
  })

  mock.onPost(/\/users$/).reply((config) => {
    const { username, nickname } = JSON.parse(config.data as string) as {
      username: string
      nickname: string
    }
    if (store.users.some((user) => user.username === username)) {
      return fail<UserInfo>(MOCK_ERROR_CODES.USERNAME_DUPLICATED, '用户名已存在')()
    }
    const created: UserInfo = {
      id: Math.max(0, ...store.users.map((user) => user.id)) + 1,
      username,
      nickname,
      roles: ['普通用户'],
      permissions: [],
      status: 1,
    }
    store.users.push(created)
    return ok(created)()
  })

  mock.onPut(/\/users\/\d+\/roles$/).reply((config) => {
    const id = Number(config.url?.match(/\/users\/(\d+)\/roles$/)?.[1])
    const user = store.users.find((item) => item.id === id)
    if (!user) return fail<UserInfo>(MOCK_ERROR_CODES.NOT_FOUND, '用户不存在')()
    const { roleIds } = JSON.parse(config.data as string) as { roleIds: number[] }
    user.roles = store.roles
      .filter((role) => roleIds.includes(role.id))
      .map((role) => role.name)
    return ok(user)()
  })

  mock.onPut(/\/users\/\d+$/).reply((config) => {
    const id = Number(config.url?.match(/\/users\/(\d+)$/)?.[1])
    const user = store.users.find((item) => item.id === id)
    if (!user) return fail<UserInfo>(MOCK_ERROR_CODES.NOT_FOUND, '用户不存在')()
    const payload = JSON.parse(config.data as string) as { nickname?: string; status?: 0 | 1 }
    if (payload.nickname !== undefined) user.nickname = payload.nickname
    if (payload.status !== undefined) user.status = payload.status
    return ok(user)()
  })

  mock.onDelete(/\/users\/\d+$/).reply((config) => {
    const id = Number(config.url?.match(/\/users\/(\d+)$/)?.[1])
    const index = store.users.findIndex((item) => item.id === id)
    if (index < 0) return fail<null>(MOCK_ERROR_CODES.NOT_FOUND, '用户不存在')()
    store.users.splice(index, 1)
    return ok<null>(null)()
  })

  // ============ 角色（7 条） ============
  mock.onGet('/roles/search').reply((config) => {
    const keyword = String(config.params?.keyword ?? '').trim()
    if (!keyword) return ok<Role[]>([])()
    return ok(
      store.roles.filter(
        (role) => role.name.includes(keyword) || role.code.includes(keyword),
      ),
    )()
  })

  mock.onGet(/\/roles$/).reply(ok(store.roles))

  mock.onGet(/\/roles\/\d+$/).reply((config) => {
    const id = Number(config.url?.match(/\/roles\/(\d+)$/)?.[1])
    const role = store.roles.find((item) => item.id === id)
    if (!role) return fail<Role>(MOCK_ERROR_CODES.NOT_FOUND, '角色不存在')()
    return ok(role)()
  })

  mock.onPost(/\/roles$/).reply((config) => {
    const { code, name, description } = JSON.parse(config.data as string) as {
      code: string
      name: string
      description?: string
    }
    if (store.roles.some((role) => role.code === code)) {
      return fail<Role>(MOCK_ERROR_CODES.ROLE_CODE_DUPLICATED, '角色编码已存在')()
    }
    const created: Role = {
      id: Math.max(0, ...store.roles.map((role) => role.id)) + 1,
      code,
      name,
      description: description ?? '',
      userCount: 0,
      status: 1,
    }
    store.roles.push(created)
    return ok(created)()
  })

  mock.onPut(/\/roles\/\d+\/permissions$/).reply((config) => {
    const id = Number(config.url?.match(/\/roles\/(\d+)\/permissions$/)?.[1])
    const role = store.roles.find((item) => item.id === id)
    if (!role) return fail<Role>(MOCK_ERROR_CODES.NOT_FOUND, '角色不存在')()
    const { permissionIds } = JSON.parse(config.data as string) as { permissionIds: number[] }
    role.permissionIds = permissionIds
    return ok(role)()
  })

  mock.onPut(/\/roles\/\d+$/).reply((config) => {
    const id = Number(config.url?.match(/\/roles\/(\d+)$/)?.[1])
    const role = store.roles.find((item) => item.id === id)
    if (!role) return fail<Role>(MOCK_ERROR_CODES.NOT_FOUND, '角色不存在')()
    const payload = JSON.parse(config.data as string) as {
      name?: string
      description?: string
      status?: 0 | 1
    }
    if (payload.name !== undefined) role.name = payload.name
    if (payload.description !== undefined) role.description = payload.description
    if (payload.status !== undefined) role.status = payload.status
    return ok(role)()
  })

  mock.onDelete(/\/roles\/\d+$/).reply((config) => {
    const id = Number(config.url?.match(/\/roles\/(\d+)$/)?.[1])
    const index = store.roles.findIndex((item) => item.id === id)
    if (index < 0) return fail<null>(MOCK_ERROR_CODES.NOT_FOUND, '角色不存在')()
    store.roles.splice(index, 1)
    return ok<null>(null)()
  })

  // ============ 权限（6 条） ============
  mock.onGet('/permissions/search').reply((config) => {
    const keyword = String(config.params?.keyword ?? '').trim()
    if (!keyword) return ok<typeof store.permissions>([])()
    return ok(
      store.permissions.filter(
        (item) => item.code.includes(keyword) || item.name.includes(keyword),
      ),
    )()
  })

  mock.onGet(/\/permissions$/).reply(ok(store.permissions))

  mock.onGet(/\/permissions\/\d+$/).reply((config) => {
    const id = Number(config.url?.match(/\/permissions\/(\d+)$/)?.[1])
    const permission = store.permissions.find((item) => item.id === id)
    if (!permission) return fail(MOCK_ERROR_CODES.NOT_FOUND, '权限不存在')()
    return ok(permission)()
  })

  mock.onPost(/\/permissions$/).reply((config) => {
    const payload = JSON.parse(config.data as string) as {
      code: string
      name: string
      module: string
      moduleName: string
      description?: string
    }
    if (store.permissions.some((item) => item.code === payload.code)) {
      return fail(MOCK_ERROR_CODES.PERMISSION_CODE_DUPLICATED, '权限码已存在')()
    }
    const created = {
      id: Math.max(0, ...store.permissions.map((item) => item.id)) + 1,
      code: payload.code,
      name: payload.name,
      module: payload.module,
      moduleName: payload.moduleName,
      description: payload.description ?? '',
      status: 1 as const,
    }
    store.permissions.push(created)
    return ok(created)()
  })

  mock.onPut(/\/permissions\/\d+$/).reply((config) => {
    const id = Number(config.url?.match(/\/permissions\/(\d+)$/)?.[1])
    const permission = store.permissions.find((item) => item.id === id)
    if (!permission) return fail(MOCK_ERROR_CODES.NOT_FOUND, '权限不存在')()
    const payload = JSON.parse(config.data as string) as {
      name?: string
      moduleName?: string
      description?: string
      status?: 0 | 1
    }
    if (payload.name !== undefined) permission.name = payload.name
    if (payload.moduleName !== undefined) permission.moduleName = payload.moduleName
    if (payload.description !== undefined) permission.description = payload.description
    if (payload.status !== undefined) permission.status = payload.status
    return ok(permission)()
  })

  mock.onDelete(/\/permissions\/\d+$/).reply((config) => {
    const id = Number(config.url?.match(/\/permissions\/(\d+)$/)?.[1])
    const index = store.permissions.findIndex((item) => item.id === id)
    if (index < 0) return fail<null>(MOCK_ERROR_CODES.NOT_FOUND, '权限不存在')()
    store.permissions.splice(index, 1)
    return ok<null>(null)()
  })

  // ============ 菜单路由权限（1 条） ============
  mock.onGet('/menus').reply(ok(mockMenuRoutes))

  // ============ 工作台 ============
  mock.onGet('/dashboard/stats').reply(ok(store.stats))
}
