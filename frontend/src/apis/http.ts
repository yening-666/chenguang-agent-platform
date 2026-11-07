import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'

import type { ApiResponse } from '@/types/api'
import { clearToken, getToken } from '@/utils/token'

/** 业务错误：后端返回 code !== 0 时抛出 */
export class ApiError extends Error {
  readonly code: number

  constructor(code: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10_000,
})

// 请求拦截器：自动携带 Token
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应错误拦截器：网络/HTTP 错误统一转换为 ApiError
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    const body = error.response?.data
    const code = body?.code ?? -1
    const message = body?.message || error.message || '网络异常'
    return Promise.reject(new ApiError(code, message))
  },
)

async function unwrap<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const response = await promise
  const body = response.data

  if (body.code !== 0) {
    if (body.code === 401 && typeof window !== 'undefined') {
      clearToken()
      window.location.href = '/login'
    }
    throw new ApiError(body.code, body.message)
  }
  return body.data
}

/** 统一请求出口：调用方直接拿到 data 部分 */
export const request = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    unwrap<T>(http.get<ApiResponse<T>>(url, { params })),
  post: <T>(url: string, data?: unknown) => unwrap<T>(http.post<ApiResponse<T>>(url, data)),
  put: <T>(url: string, data?: unknown) => unwrap<T>(http.put<ApiResponse<T>>(url, data)),
  delete: <T>(url: string, params?: Record<string, unknown>) =>
    unwrap<T>(http.delete<ApiResponse<T>>(url, { params })),
}

export default http
