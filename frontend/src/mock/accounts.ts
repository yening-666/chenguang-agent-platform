import type { UserInfo } from '@/types/rbac'

/** mock 账号（用于登录接口与 E2E 直登演示） */
export interface MockAccount {
  username: string
  password: string
  token: string
  user: UserInfo
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    username: 'admin',
    password: '123456',
    token: 'mock-token-admin',
    user: {
      id: 1,
      username: 'admin',
      nickname: '超级管理员',
      roles: ['超级管理员'],
      permissions: ['*'],
      status: 1,
    },
  },
  {
    username: 'sysadmin',
    password: '123456',
    token: 'mock-token-sysadmin',
    user: {
      id: 2,
      username: 'sysadmin',
      nickname: '系统管理员',
      roles: ['系统管理员'],
      permissions: [
        'dashboard:view',
        'user:list',
        'user:create',
        'user:update',
        'role:list',
        'permission:list',
      ],
      status: 1,
    },
  },
  {
    username: 'viewer',
    password: '123456',
    token: 'mock-token-viewer',
    user: {
      id: 3,
      username: 'viewer',
      nickname: '访客账号',
      roles: ['普通用户'],
      permissions: ['dashboard:view'],
      status: 1,
    },
  },
]

/** 业务错误码（mock 与 http 层共用约定） */
export const MOCK_ERROR_CODES = {
  LOGIN_FAILED: 1001,
  USERNAME_DUPLICATED: 1002,
  ROLE_CODE_DUPLICATED: 1003,
  PERMISSION_CODE_DUPLICATED: 1004,
  NOT_FOUND: 1005,
} as const
