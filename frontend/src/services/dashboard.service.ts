import { dashboardApi } from '@/apis/dashboard.api'

import type { DashboardStats } from '@/types/rbac'

/** 工作台业务逻辑 */
export const dashboardService = {
  /** 获取工作台统计数据 */
  getStats(): Promise<DashboardStats> {
    return dashboardApi.stats()
  },
}
