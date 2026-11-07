/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 接口基础路径，如 /api/v1 */
  readonly VITE_API_BASE_URL: string
  /** 是否启用 Mock（axios-mock-adapter 拦截全部请求） */
  readonly VITE_USE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
