const TOKEN_KEY = 'cg_token'

/** node 测试环境（无 localStorage）下的内存兜底 */
const memoryStore = new Map<string, string>()

function safeGet(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key)
    }
  } catch {
    /* localStorage 不可用时忽略 */
  }
  return memoryStore.get(key) ?? null
}

function safeSet(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value)
      return
    }
  } catch {
    /* localStorage 不可用时忽略 */
  }
  memoryStore.set(key, value)
}

function safeRemove(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key)
      return
    }
  } catch {
    /* localStorage 不可用时忽略 */
  }
  memoryStore.delete(key)
}

export function getToken(): string | null {
  return safeGet(TOKEN_KEY)
}

export function setToken(token: string): void {
  safeSet(TOKEN_KEY, token)
}

export function clearToken(): void {
  safeRemove(TOKEN_KEY)
}
