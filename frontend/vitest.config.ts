import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: 'coverage',
      // 不清理输出目录（避免生成报告时批量删除既有产物）
      clean: false,
      include: [
        'src/apis/**/*.ts',
        'src/services/**/*.ts',
        'src/store/**/*.ts',
        'src/router/**/*.ts',
        'src/mock/**/*.ts',
        'src/components/**/*.vue',
        'src/pages/**/*.vue',
      ],
      exclude: ['src/**/*.d.ts', 'src/main.ts', 'src/App.vue'],
    },
  },
})
