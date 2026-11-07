<script setup lang="ts">
</script>

<template>
  <RouterView />
</template>

<style>
:root {
  --cg-primary: #2563eb;
  --cg-sidebar-bg: #0f172a;
  --cg-text: #0f172a;
  --cg-muted: #64748b;
  --cg-border: #e2e8f0;
  --cg-bg: #f1f5f9;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Microsoft YaHei', 'PingFang SC', system-ui, -apple-system, sans-serif;
  color: var(--cg-text);
  background: var(--cg-bg);
  font-size: 14px;
}

.btn {
  padding: 6px 14px;
  border: 1px solid var(--cg-border);
  border-radius: 6px;
  background: #fff;
  color: var(--cg-text);
  cursor: pointer;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--cg-primary);
  border-color: var(--cg-primary);
  color: #fff;
}

.btn--sm {
  padding: 4px 10px;
  font-size: 12px;
}

.page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  font-size: 18px;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.toolbar input {
  padding: 6px 10px;
  border: 1px solid var(--cg-border);
  border-radius: 6px;
  min-width: 220px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.table th,
.table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--cg-border);
  text-align: left;
  font-size: 14px;
}

.table th {
  background: #f8fafc;
  color: var(--cg-muted);
  font-weight: 500;
}

.role-badge {
  display: inline-block;
  margin-right: 6px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #eff6ff;
  color: var(--cg-primary);
  font-size: 12px;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.toolbar input {
  padding: 6px 10px;
  border: 1px solid var(--cg-border);
  border-radius: 6px;
  min-width: 220px;
}

.page-total {
  margin-top: 10px;
  color: var(--cg-muted);
  font-size: 13px;
}

.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 20px;
}

.error-page h1 {
  font-size: 48px;
  color: var(--cg-primary);
}

.error-perm code {
  background: #fee2e2;
  color: #b91c1c;
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
