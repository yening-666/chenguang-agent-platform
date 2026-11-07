import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { pinia } from './store'

async function bootstrap(): Promise<void> {
  const app = createApp(App)

  // Pinia 状态管理（先于路由安装，路由守卫依赖 store）
  app.use(pinia)

  // Mock 模式：动态引入 mock 模块，生产构建自动 tree-shake
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { setupMock } = await import('./mock')
    setupMock()
  }

  app.use(router)
  app.mount('#app')
}

void bootstrap()
