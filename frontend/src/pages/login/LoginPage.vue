<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ApiError } from '@/apis/http'
import { useAuthStore } from '@/store/modules/auth.store'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({ username: 'admin', password: '123456' })
const submitting = ref(false)
const errorText = ref('')

async function handleSubmit(): Promise<void> {
  errorText.value = ''
  submitting.value = true
  try {
    await auth.login(form.username, form.password)
    const redirect = route.query.redirect
    router.push(typeof redirect === 'string' && redirect ? redirect : '/dashboard')
  } catch (error) {
    errorText.value =
      error instanceof ApiError || error instanceof Error ? error.message : '登录失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="handleSubmit">
      <h1 class="login-card__title">晨光 Agent 平台</h1>
      <p class="login-card__subtitle">RBAC 权限演示（mock 模式）</p>

      <label class="login-card__field">
        <span>用户名</span>
        <input v-model="form.username" type="text" placeholder="请输入用户名" />
      </label>

      <label class="login-card__field">
        <span>密码</span>
        <input v-model="form.password" type="password" placeholder="请输入密码" />
      </label>

      <p v-if="errorText" class="login-card__error">{{ errorText }}</p>

      <button class="btn btn--primary login-card__submit" type="submit" :disabled="submitting">
        {{ submitting ? '登录中…' : '登录' }}
      </button>

      <div class="login-card__tips">
        <p>mock 演示账号（密码均为 123456）：</p>
        <p>admin=超级管理员 / sysadmin=系统管理员 / viewer=访客</p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--cg-bg);
}

.login-card {
  width: 360px;
  background: #fff;
  border: 1px solid var(--cg-border);
  border-radius: 12px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.login-card__title {
  font-size: 20px;
  text-align: center;
}

.login-card__subtitle {
  text-align: center;
  color: var(--cg-muted);
  font-size: 12px;
}

.login-card__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login-card__field span {
  color: var(--cg-muted);
  font-size: 13px;
}

.login-card__field input {
  padding: 8px 12px;
  border: 1px solid var(--cg-border);
  border-radius: 6px;
  font-size: 14px;
}

.login-card__error {
  color: #b91c1c;
  font-size: 13px;
}

.login-card__submit {
  padding: 10px 0;
}

.login-card__tips {
  font-size: 12px;
  color: var(--cg-muted);
  line-height: 1.6;
}
</style>
