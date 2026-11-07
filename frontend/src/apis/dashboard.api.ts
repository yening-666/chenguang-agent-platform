import { request } from './http'

import type { DashboardStats } from '@/types/rbac'

/** 工作台 API */
export const dashboardApi = {
  stats: () => request.get<DashboardStats>('/dashboard/stats'),
}
