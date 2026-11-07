import type { DashboardStats, MenuRouteItem, Permission, Role, UserInfo } from '@/types/rbac'

/** 可变 mock 数据仓库（每个测试可独立创建，避免用例间污染） */
export interface MockStore {
  users: UserInfo[]
  roles: Role[]
  permissions: Permission[]
  stats: DashboardStats
}

const initialUsers: UserInfo[] = [
  { id: 1, username: 'admin', nickname: '超级管理员', roles: ['超级管理员'], permissions: ['*'], status: 1 },
  { id: 2, username: 'sysadmin', nickname: '系统管理员', roles: ['系统管理员'], permissions: [], status: 1 },
  { id: 3, username: 'viewer', nickname: '访客账号', roles: ['普通用户'], permissions: [], status: 1 },
  { id: 4, username: 'zhangsan', nickname: '张三', roles: ['普通用户'], permissions: [], status: 1 },
  { id: 5, username: 'lisi', nickname: '李四', roles: ['普通用户'], permissions: [], status: 0 },
]

const initialRoles: Role[] = [
  { id: 1, code: 'super_admin', name: '超级管理员', description: '拥有全部权限', userCount: 1, status: 1 },
  { id: 2, code: 'sys_admin', name: '系统管理员', description: '管理用户与查看权限', userCount: 1, status: 1 },
  { id: 3, code: 'user', name: '普通用户', description: '仅查看工作台', userCount: 3, status: 1 },
]

const initialPermissions: Permission[] = [
  { id: 1, code: 'dashboard:view', name: '工作台查看', module: 'dashboard', moduleName: '工作台', description: '查看工作台统计数据', status: 1 },
  { id: 2, code: 'user:list', name: '用户查询', module: 'user', moduleName: '用户管理', description: '查询用户列表', status: 1 },
  { id: 3, code: 'user:create', name: '用户创建', module: 'user', moduleName: '用户管理', description: '新增用户', status: 1 },
  { id: 4, code: 'user:update', name: '用户编辑', module: 'user', moduleName: '用户管理', description: '编辑用户信息与状态', status: 1 },
  { id: 5, code: 'user:assign_roles', name: '分配角色', module: 'user', moduleName: '用户管理', description: '为用户分配角色', status: 1 },
  { id: 6, code: 'role:list', name: '角色查询', module: 'role', moduleName: '角色管理', description: '查询角色列表', status: 1 },
  { id: 7, code: 'role:create', name: '角色创建', module: 'role', moduleName: '角色管理', description: '新增角色', status: 1 },
  { id: 8, code: 'role:assign_permissions', name: '分配权限', module: 'role', moduleName: '角色管理', description: '为角色分配权限', status: 1 },
  { id: 9, code: 'permission:list', name: '权限查询', module: 'permission', moduleName: '权限管理', description: '查询权限列表', status: 1 },
  { id: 10, code: 'permission:create', name: '权限创建', module: 'permission', moduleName: '权限管理', description: '新增权限', status: 1 },
]

const initialStats: DashboardStats = {
  userCount: 5,
  roleCount: 3,
  permissionCount: 10,
  todayLogins: 12,
}

/** 创建独立的 mock 数据仓库（深拷贝，测试间互不污染） */
export function createMockStore(): MockStore {
  return {
    users: initialUsers.map((user) => ({ ...user })),
    roles: initialRoles.map((role) => ({ ...role })),
    permissions: initialPermissions.map((item) => ({ ...item })),
    stats: { ...initialStats },
  }
}

/** 菜单路由权限数据（与前端路由表一致，供菜单路由权限页展示） */

export const mockMenuRoutes: MenuRouteItem[] = [
  { path: '/login', name: 'login', title: '登录', permission: null, inMenu: false },
  { path: '/dashboard', name: 'dashboard', title: '工作台', permission: 'dashboard:view', inMenu: true },
  { path: '/system/users', name: 'system-users', title: '用户管理', permission: 'user:list', inMenu: true },
  { path: '/system/roles', name: 'system-roles', title: '角色管理', permission: 'role:list', inMenu: true },
  { path: '/system/permissions', name: 'system-permissions', title: '权限管理', permission: 'permission:list', inMenu: true },
  { path: '/system/menus', name: 'system-menus', title: '菜单路由权限', permission: 'permission:list', inMenu: true },
  { path: '/403', name: 'forbidden', title: '无权访问', permission: null, inMenu: false },
  { path: '/:pathMatch(.*)*', name: 'not-found', title: '页面不存在', permission: null, inMenu: false },
]
