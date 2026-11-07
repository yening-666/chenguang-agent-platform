<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import EmptyState from '@/components/common/EmptyState.vue'
import { useAuthStore } from '@/store/modules/auth.store'
import { usePermissionStore } from '@/store/modules/permission.store'
import type { Permission } from '@/types/rbac'

const auth = useAuthStore()
const permissionStore = usePermissionStore()

const errorText = ref('')

/** 新增/编辑权限弹窗状态 */
const dialogVisible = ref(false)
const editingPermission = ref<Permission | null>(null)
const form = reactive({ code: '', name: '', module: '', moduleName: '', description: '' })

onMounted(() => {
  void permissionStore.fetchPermissions()
})

function openCreateDialog(): void {
  editingPermission.value = null
  form.code = ''
  form.name = ''
  form.module = ''
  form.moduleName = ''
  form.description = ''
  dialogVisible.value = true
}

function openEditDialog(permission: Permission): void {
  editingPermission.value = permission
  form.code = permission.code
  form.name = permission.name
  form.module = permission.module
  form.moduleName = permission.moduleName
  form.description = permission.description
  dialogVisible.value = true
}

function closeDialog(): void {
  dialogVisible.value = false
  editingPermission.value = null
}

async function confirmDialog(): Promise<void> {
  if (editingPermission.value) {
    await permissionStore.updatePermission(editingPermission.value.id, {
      name: form.name,
      moduleName: form.moduleName,
      description: form.description,
    })
  } else {
    await permissionStore.createPermission({
      code: form.code,
      name: form.name,
      module: form.module,
      moduleName: form.moduleName,
      description: form.description,
    })
  }
  closeDialog()
}

function handleRemove(permission: Permission): void {
  void permissionStore.removePermission(permission.id)
}
</script>

<template>
  <section>
    <div class="page-header">
      <h2>权限管理</h2>
      <button
        v-if="auth.hasPermission('permission:create')"
        class="btn btn--primary"
        @click="openCreateDialog"
      >新增权限</button>
    </div>

    <p v-if="errorText" class="page-total">{{ errorText }}</p>

    <EmptyState v-else-if="permissionStore.groups.length === 0" text="暂无权限数据" />

    <div v-else class="perm-groups">
      <div v-for="group in permissionStore.groups" :key="group.module" class="perm-groups__group">
        <h3 class="perm-groups__title">{{ group.moduleName }}（{{ group.module }}）</h3>
        <table class="table">
          <thead>
            <tr>
              <th>权限码</th>
              <th>权限名称</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in group.items" :key="item.id">
              <td><code>{{ item.code }}</code></td>
              <td>{{ item.name }}</td>
              <td>{{ item.description }}</td>
              <td class="perm-actions">
                <button
                  v-if="auth.hasPermission('permission:update')"
                  class="btn btn--sm"
                  @click="openEditDialog(item)"
                >编辑</button>
                <button
                  v-if="auth.hasPermission('permission:delete')"
                  class="btn btn--sm perm-actions__danger"
                  @click="handleRemove(item)"
                >删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新增/编辑权限弹窗（permission:create / permission:update） -->
    <div v-if="dialogVisible" class="dialog-mask" @click.self="closeDialog">
      <div class="dialog">
        <h3 class="dialog__title">{{ editingPermission ? '编辑权限' : '新增权限' }}</h3>
        <div class="dialog__body">
          <label class="dialog__field">
            <span>权限码（模块:操作）</span>
            <input v-model="form.code" type="text" :disabled="editingPermission !== null" />
          </label>
          <label class="dialog__field">
            <span>权限名称</span>
            <input v-model="form.name" type="text" />
          </label>
          <label class="dialog__field">
            <span>模块标识（module）</span>
            <input v-model="form.module" type="text" :disabled="editingPermission !== null" />
          </label>
          <label class="dialog__field">
            <span>模块名称（moduleName）</span>
            <input v-model="form.moduleName" type="text" />
          </label>
          <label class="dialog__field">
            <span>描述</span>
            <input v-model="form.description" type="text" />
          </label>
        </div>
        <div class="dialog__footer">
          <button class="btn" @click="closeDialog">取消</button>
          <button class="btn btn--primary" @click="confirmDialog">确认</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.perm-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.perm-groups__title {
  font-size: 15px;
  margin-bottom: 8px;
}

.perm-groups__group code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: Consolas, monospace;
}

.perm-actions {
  display: flex;
  gap: 6px;
}

.perm-actions__danger {
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
  width: 460px;
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
