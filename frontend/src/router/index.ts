import { createRouter, createWebHistory } from 'vue-router'

import { setupGuards } from './guards'

import type { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题 */
    title?: string
    /** 是否需要登录（默认需要，公开页显式声明 false） */
    requiresAuth?: boolean
    /** 访问所需权限码（如 user:list） */
    permission?: string
  }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/LoginPage.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/dashboard/DashboardPage.vue'),
        meta: { title: '工作台', permission: 'dashboard:view' },
      },
      {
        path: 'system/users',
        name: 'system-users',
        component: () => import('@/pages/system/UserPage.vue'),
        meta: { title: '用户管理', permission: 'user:list' },
      },
      {
        path: 'system/roles',
        name: 'system-roles',
        component: () => import('@/pages/system/RolePage.vue'),
        meta: { title: '角色管理', permission: 'role:list' },
      },
      {
        path: 'system/permissions',
        name: 'system-permissions',
        component: () => import('@/pages/system/PermissionPage.vue'),
        meta: { title: '权限管理', permission: 'permission:list' },
      },
      {
        path: 'system/menus',
        name: 'system-menus',
        component: () => import('@/pages/system/MenuPage.vue'),
        meta: { title: '菜单路由权限', permission: 'permission:list' },
      },
    ],
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/pages/error/ForbiddenPage.vue'),
    meta: { title: '无权访问', requiresAuth: false },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/error/NotFoundPage.vue'),
    meta: { title: '页面不存在', requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

setupGuards(router)

export default router
