/** 后端统一响应结构：{ code, message, data }，code === 0 表示业务成功 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页请求参数 */
export interface PageQuery {
  page: number
  pageSize: number
  keyword?: string
}

/** 分页响应结构 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
