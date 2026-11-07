/** 用户信息 */
export interface UserInfo {
  id: number
  username: string
  nickname: string
  roles: string[]
  permissions: string[]
  status: 0 | 1
}

/** 登录结果 */
export interface LoginResult {
  token: string
  user: UserInfo
}

/** 角色 */
export interface Role {
  id: number
  code: string
  name: string
  description: string
  userCount: number
  status: 0 | 1
  /** 角色已分配的权限 ID 列表（分配权限接口使用） */
  permissionIds?: number[]
}

/** 权限 */
export interface Permission {
  id: number
  code: string
  name: string
  module: string
  moduleName: string
  description: string
  status: 0 | 1
}

/** 工作台统计 */
export interface DashboardStats {
  userCount: number
  roleCount: number
  permissionCount: number
  todayLogins: number
}

/** 菜单路由权限项（前端路由表 × 所需权限码） */
export interface MenuRouteItem {
  path: string
  name: string
  title: string
  /** 所需权限码；null 表示登录即可 */
  permission: string | null
  /** 是否出现在侧边栏菜单 */
  inMenu: boolean
}
