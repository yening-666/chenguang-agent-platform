<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import EmptyState from '@/components/common/EmptyState.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { useAuthStore } from '@/store/modules/auth.store'
import { usePermissionStore } from '@/store/modules/permission.store'
import { useRoleStore } from '@/store/modules/role.store'
import type { Role } from '@/types/rbac'

const auth = useAuthStore()
const roleStore = useRoleStore()
const permissionStore = usePermissionStore()

const errorText = ref('')

/** 分配权限弹窗状态 */
const permDialogVisible = ref(false)
const permTarget = ref<Role | null>(null)
const selectedPermissionIds = ref<number[]>([])

/** 新增/编辑角色弹窗状态 */
const roleDialogVisible = ref(false)
const editingRole = ref<Role | null>(null)
const roleForm = reactive({ code: '', name: '', description: '' })

onMounted(() => {
  void roleStore.fetchRoles()
  void permissionStore.fetchPermissions()
})

/** 打开分配权限弹窗（按模块分组展示，预勾选角色已有权限） */
function openPermDialog(role: Role): void {
  permTarget.value = role
  selectedPermissionIds.value = [...(role.permissionIds ?? [])]
  permDialogVisible.value = true
}

function closePermDialog(): void {
  permDialogVisible.value = false
  permTarget.value = null
  selectedPermissionIds.value = []
}

async function confirmAssignPermissions(): Promise<void> {
  if (!permTarget.value) return
  await roleStore.assignPermissions(permTarget.value.id, selectedPermissionIds.value)
  closePermDialog()
}

function togglePermissionSelection(permissionId: number): void {
  const index = selectedPermissionIds.value.indexOf(permissionId)
  if (index >= 0) {
    selectedPermissionIds.value.splice(index, 1)
  } else {
    selectedPermissionIds.value.push(permissionId)
  }
}

function toggleGroup(module: string): void {
  const group = permissionStore.groups.find((group) => group.module === module)
  if (!group) return
  const groupIds = group.items.map((item) => item.id)
  const allSelected = groupIds.every((id) => selectedPermissionIds.value.includes(id))
  selectedPermissionIds.value = allSelected
    ? selectedPermissionIds.value.filter((id) => !groupIds.includes(id))
    : [...new Set([...selectedPermissionIds.value, ...groupIds])]
}

function openCreateDialog(): void {
  editingRole.value = null
  roleForm.code = ''
  roleForm.name = ''
  roleForm.description = ''
  roleDialogVisible.value = true
}

function openEditDialog(role: Role): void {
  editingRole.value = role
  roleForm.code = role.code
  roleForm.name = role.name
  roleForm.description = role.description
  roleDialogVisible.value = true
}

function closeRoleDialog(): void {
  roleDialogVisible.value = false
  editingRole.value = null
}

async function confirmRoleDialog(): Promise<void> {
  if (editingRole.value) {
    await roleStore.updateRole(editingRole.value.id, {
      name: roleForm.name,
      description: roleForm.description,
    })
  } else {
    await roleStore.createRole({
      code: roleForm.code,
      name: roleForm.name,
      description: roleForm.description,
    })
  }
  closeRoleDialog()
}

function handleRemove(role: Role): void {
  void roleStore.removeRole(role.id)
}
</script>

<template>
  <section>
    <div class="page-header">
      <h2>角色管理</h2>
      <button
        v-if="auth.hasPermission('role:create')"
        class="btn btn--primary"
        @click="openCreateDialog"
      >新增角色</button>
    </div>

    <p v-if="errorText" class="page-total">{{ errorText }}</p>

    <table v-else-if="roleStore.roles.length" class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>角色编码</th>
          <th>角色名称</th>
          <th>描述</th>
          <th>用户数</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="role in roleStore.roles" :key="role.id">
          <td>{{ role.id }}</td>
          <td><code>{{ role.code }}</code></td>
          <td>{{ role.name }}</td>
          <td>{{ role.description }}</td>
          <td>{{ role.userCount }}</td>
          <td><StatusTag :status="role.status" /></td>
          <td class="role-actions">
            <button
              v-if="auth.hasPermission('role:assign_permissions')"
              class="btn btn--sm"
              @click="openPermDialog(role)"
            >分配权限</button>
            <button
              v-if="auth.hasPermission('role:update')"
              class="btn btn--sm"
              @click="openEditDialog(role)"
            >编辑</button>
            <button
              v-if="auth.hasPermission('role:delete')"
              class="btn btn--sm role-actions__danger"
              @click="handleRemove(role)"
            >删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <EmptyState v-else text="暂无角色数据" />

    <!-- 分配权限弹窗（role:assign_permissions，按模块分组） -->
    <div v-if="permDialogVisible" class="dialog-mask" @click.self="closePermDialog">
      <div class="dialog">
        <h3 class="dialog__title">为「{{ permTarget?.name }}」分配权限</h3>
        <div class="dialog__body">
          <div
            v-for="group in permissionStore.groups"
            :key="group.module"
            class="dialog__group"
          >
            <label class="dialog__group-title">
              <input
                type="checkbox"
                :checked="group.items.every((item) => selectedPermissionIds.includes(item.id))"
                @change="toggleGroup(group.module)"
              />
              <strong>{{ group.moduleName }}（{{ group.module }}）</strong>
            </label>
            <label
              v-for="item in group.items"
              :key="item.id"
              class="dialog__option"
            >
              <input
                type="checkbox"
                :checked="selectedPermissionIds.includes(item.id)"
                @change="togglePermissionSelection(item.id)"
              />
              <span>{{ item.name }}</span>
              <code class="dialog__code">{{ item.code }}</code>
            </label>
          </div>
        </div>
        <div class="dialog__footer">
          <button class="btn" @click="closePermDialog">取消</button>
          <button class="btn btn--primary" @click="confirmAssignPermissions">确认分配</button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑角色弹窗（role:create / role:update） -->
    <div v-if="roleDialogVisible" class="dialog-mask" @click.self="closeRoleDialog">
      <div class="dialog">
        <h3 class="dialog__title">{{ editingRole ? '编辑角色' : '新增角色' }}</h3>
        <div class="dialog__body">
          <label class="dialog__field">
            <span>角色编码（code）</span>
            <input v-model="roleForm.code" type="text" :disabled="editingRole !== null" />
          </label>
          <label class="dialog__field">
            <span>角色名称</span>
            <input v-model="roleForm.name" type="text" />
          </label>
          <label class="dialog__field">
            <span>描述</span>
            <input v-model="roleForm.description" type="text" />
          </label>
        </div>
        <div class="dialog__footer">
          <button class="btn" @click="closeRoleDialog">取消</button>
          <button class="btn btn--primary" @click="confirmRoleDialog">确认</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.role-actions {
  display: flex;
  gap: 6px;
}

.role-actions__danger {
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
  width: 480px;
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
  gap: 10px;
  max-height: 420px;
  overflow-y: auto;
}

.dialog__group {
  border: 1px solid var(--cg-border);
  border-radius: 6px;
  padding: 8px 10px;
}

.dialog__group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  cursor: pointer;
}

.dialog__option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 6px 24px;
  border-radius: 4px;
  cursor: pointer;
}

.dialog__option:hover {
  background: #f8fafc;
}

.dialog__code {
  margin-left: auto;
  color: var(--cg-muted);
  font-size: 12px;
  font-family: Consolas, monospace;
}

.dialog__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dialog__field span {
  color: var(--cg-muted);
  font-size: 13px;
}

.dialog__field input {
  padding: 8px 12px;
  border: 1px solid var(--cg-border);
  border-radius: 6px;
  font-size: 14px;
}

.dialog__field input:disabled {
  background: #f8fafc;
  color: var(--cg-muted);
}

.dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
</style>
