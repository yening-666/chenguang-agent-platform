<script setup lang="ts">
import { onMounted, ref } from 'vue'

import EmptyState from '@/components/common/EmptyState.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { useAuthStore } from '@/store/modules/auth.store'
import { useRoleStore } from '@/store/modules/role.store'
import { useUserStore } from '@/store/modules/user.store'
import type { UserInfo } from '@/types/rbac'

const auth = useAuthStore()
const userStore = useUserStore()
const roleStore = useRoleStore()

/** 分配角色弹窗状态 */
const assignDialogVisible = ref(false)
const assignTarget = ref<UserInfo | null>(null)
const selectedRoleIds = ref<number[]>([])

onMounted(() => {
  void userStore.fetchUsers()
  void roleStore.fetchRoles()
})

function handleSearch(): void {
  userStore.query.page = 1
  void userStore.fetchUsers()
}

function handlePageChange(next: number): void {
  userStore.query.page = next
  void userStore.fetchUsers()
}

/** 打开分配角色弹窗，预勾选用户已有角色 */
function openAssignDialog(user: UserInfo): void {
  assignTarget.value = user
  const userRoleIds = user.roles
    .map((name) => roleStore.roles.find((role) => role.name === name)?.id)
    .filter((id): id is number => typeof id === 'number')
  selectedRoleIds.value = userRoleIds
  assignDialogVisible.value = true
}

function closeAssignDialog(): void {
  assignDialogVisible.value = false
  assignTarget.value = null
  selectedRoleIds.value = []
}

async function confirmAssignRoles(): Promise<void> {
  if (!assignTarget.value) return
  await userStore.assignRoles(assignTarget.value.id, selectedRoleIds.value)
  closeAssignDialog()
}

function toggleRoleSelection(roleId: number): void {
  const index = selectedRoleIds.value.indexOf(roleId)
  if (index >= 0) {
    selectedRoleIds.value.splice(index, 1)
  } else {
    selectedRoleIds.value.push(roleId)
  }
}

async function handleRemove(user: UserInfo): Promise<void> {
  await userStore.removeUser(user.id)
}

async function handleToggleStatus(user: UserInfo): Promise<void> {
  await userStore.toggleStatus(user)
}

function handleCreate(): void {
  void userStore.createUser({ username: `user${Date.now() % 1000}`, nickname: '新用户' })
}
</script>

<template>
  <section>
    <div class="page-header">
      <h2>用户管理</h2>
      <button
        v-if="auth.hasPermission('user:create')"
        class="btn btn--primary"
        @click="handleCreate"
      >新增用户</button>
    </div>

    <div class="toolbar">
      <input
        v-model="userStore.query.keyword"
        type="text"
        placeholder="搜索用户名 / 昵称"
        @keyup.enter="handleSearch"
      />
      <button class="btn" @click="handleSearch">搜索</button>
    </div>

    <table v-if="userStore.list.length" class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>用户名</th>
          <th>昵称</th>
          <th>角色</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in userStore.list" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.nickname }}</td>
          <td>
            <span v-for="role in user.roles" :key="role" class="role-badge">{{ role }}</span>
          </td>
          <td><StatusTag :status="user.status" /></td>
          <td class="user-actions">
            <button
              v-if="auth.hasPermission('user:assign_roles')"
              class="btn btn--sm"
              @click="openAssignDialog(user)"
            >分配角色</button>
            <button
              v-if="auth.hasPermission('user:update')"
              class="btn btn--sm"
              @click="handleToggleStatus(user)"
            >{{ user.status === 1 ? '禁用' : '启用' }}</button>
            <button
              v-if="auth.hasPermission('user:delete')"
              class="btn btn--sm user-actions__danger"
              @click="handleRemove(user)"
            >删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <EmptyState v-else text="暂无用户数据" />

    <div class="page-total">
      共 {{ userStore.total }} 条
      <button
        class="btn btn--sm"
        :disabled="userStore.query.page <= 1"
        @click="handlePageChange(userStore.query.page - 1)"
      >上一页</button>
      <span>第 {{ userStore.query.page }} 页</span>
      <button
        class="btn btn--sm"
        :disabled="userStore.query.page * userStore.query.pageSize >= userStore.total"
        @click="handlePageChange(userStore.query.page + 1)"
      >下一页</button>
    </div>

    <!-- 分配角色弹窗（user:assign_roles） -->
    <div v-if="assignDialogVisible" class="dialog-mask" @click.self="closeAssignDialog">
      <div class="dialog">
        <h3 class="dialog__title">为「{{ assignTarget?.nickname }}」分配角色</h3>
        <div class="dialog__body">
          <label
            v-for="role in roleStore.roles"
            :key="role.id"
            class="dialog__option"
          >
            <input
              type="checkbox"
              :checked="selectedRoleIds.includes(role.id)"
              @change="toggleRoleSelection(role.id)"
            />
            <span>{{ role.name }}</span>
            <code class="dialog__code">{{ role.code }}</code>
          </label>
        </div>
        <div class="dialog__footer">
          <button class="btn" @click="closeAssignDialog">取消</button>
          <button class="btn btn--primary" @click="confirmAssignRoles">确认分配</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.user-actions {
  display: flex;
  gap: 6px;
}

.user-actions__danger {
  color: #b91c1c;
  border-color: #fecaca;
}

.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.dialog {
  width: 420px;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.2);
}

.dialog__title {
  font-size: 16px;
  margin-bottom: 14px;
}

.dialog__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
}

.dialog__option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--cg-border);
  border-radius: 6px;
  cursor: pointer;
}

.dialog__code {
  margin-left: auto;
  color: var(--cg-muted);
  font-size: 12px;
  font-family: Consolas, monospace;
}

.dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
</style>
