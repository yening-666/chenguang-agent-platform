/* ============================================================
   辰光Agent平台 — RBAC 原型共享脚本（纯前端 Mock，无后端依赖）
   数据与权限码严格对齐 docs/spec/PROJECT_SPEC_V2.md 第八节鉴权矩阵
   ============================================================ */

/* ---------- 权限码清单（对齐 PRD 鉴权矩阵） ---------- */
const PERMS = {
  user: [
    { code: 'user:list', name: '用户列表' },
    { code: 'user:read', name: '用户详情' },
    { code: 'user:create', name: '创建用户' },
    { code: 'user:update', name: '编辑用户' },
    { code: 'user:delete', name: '删除用户' },
    { code: 'user:assign_roles', name: '分配角色' },
  ],
  role: [
    { code: 'role:list', name: '角色列表' },
    { code: 'role:read', name: '角色详情' },
    { code: 'role:create', name: '创建角色' },
    { code: 'role:update', name: '编辑角色' },
    { code: 'role:delete', name: '删除角色' },
    { code: 'role:assign_permissions', name: '分配权限' },
  ],
  permission: [
    { code: 'permission:list', name: '权限列表' },
    { code: 'permission:read', name: '权限详情' },
    { code: 'permission:create', name: '创建权限' },
    { code: 'permission:update', name: '编辑权限' },
    { code: 'permission:delete', name: '删除权限' },
  ],
  knowledge: [
    { code: 'knowledge:list', name: '知识库列表' },
    { code: 'knowledge:create', name: '创建知识库' },
    { code: 'knowledge:delete', name: '删除知识库' },
    { code: 'knowledge:upload_document', name: '上传文档' },
  ],
  agent: [
    { code: 'agent:list', name: 'Agent 列表' },
    { code: 'agent:create', name: '创建 Agent' },
    { code: 'agent:publish', name: '发布 Agent' },
  ],
  model: [
    { code: 'model:list', name: '模型列表' },
    { code: 'model:create', name: '创建模型' },
  ],
  prompt: [{ code: 'prompt:list', name: 'Prompt 列表' }],
  tool: [{ code: 'tool:list', name: '工具列表' }],
  provider: [{ code: 'provider:list', name: '供应商列表' }],
};

/* ---------- 模拟用户（身份切换演示数据源） ---------- */
const MOCK_IDENTITY = {
  superadmin: {
    name: 'admin', label: '超级管理员', isSuper: true,
    perms: null, /* null = 直通全部 */
  },
  sysadmin: {
    name: 'sysadmin', label: '系统管理员',
    perms: ['user:list', 'user:read', 'user:create', 'user:update', 'user:delete', 'user:assign_roles',
            'role:list', 'role:read', 'role:create', 'role:update', 'role:assign_permissions',
            'permission:list', 'permission:read', 'permission:create', 'permission:update',
            'knowledge:list', 'knowledge:create', 'knowledge:upload_document',
            'agent:list', 'model:list', 'prompt:list', 'tool:list', 'provider:list'],
  },
  viewer: {
    name: 'viewer', label: '普通用户（只读）',
    perms: ['user:list', 'role:list', 'permission:list',
            'knowledge:list', 'agent:list', 'model:list', 'prompt:list', 'tool:list', 'provider:list'],
  },
};

let CURRENT = 'superadmin';

/* ---------- 工具函数 ---------- */
function hasPerm(code) {
  const u = MOCK_IDENTITY[CURRENT];
  if (u.isSuper) return true;               /* 超管直通（PRD FR-3） */
  return Array.isArray(u.perms) && u.perms.includes(code);
}

function permCount() {
  const u = MOCK_IDENTITY[CURRENT];
  if (u.isSuper) return Object.values(PERMS).reduce((n, arr) => n + arr.length, 0);
  return (u.perms || []).length;
}

function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<span class="dot"></span><span class="msg"></span>';
    document.body.appendChild(el);
  }
  el.querySelector('.msg').textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2400);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

/* ---------- 侧边栏菜单按权限显隐（PRD FR-5） ---------- */
function applyMenuPermissions() {
  document.querySelectorAll('.sidebar-nav a[data-perm]').forEach((a) => {
    const need = a.dataset.perm;
    /* data-perm 以空格分隔可声明多个权限码（OR 语义用于菜单入口） */
    const codes = need.split(/\s+/).filter(Boolean);
    const visible = codes.length === 0 || codes.some(hasPerm);
    a.style.display = visible ? '' : 'none';
  });
  /* 分组标题下若无可见项则隐藏分组标题 */
  document.querySelectorAll('.group-title').forEach((title) => {
    let next = title.nextElementSibling, hasVisible = false;
    while (next && !next.classList.contains('group-title')) {
      if (next.tagName === 'A' && next.style.display !== 'none') hasVisible = true;
      next = next.nextElementSibling;
    }
    title.style.display = hasVisible ? '' : 'none';
  });
}

/* ---------- 操作按钮按权限禁用（体验层兜底提示） ---------- */
function applyActionPermissions() {
  document.querySelectorAll('[data-action-perm]').forEach((btn) => {
    if (!hasPerm(btn.dataset.actionPerm)) {
      btn.disabled = true;
      btn.title = '缺少权限：' + btn.dataset.actionPerm;
    }
  });
}

/* ---------- 身份切换器 ---------- */
function renderIdentity() {
  const u = MOCK_IDENTITY[CURRENT];
  const sel = document.getElementById('identitySelect');
  if (sel) sel.value = CURRENT;
  const avatar = document.querySelector('.user-chip .avatar');
  const name = document.querySelector('.user-chip .name');
  const role = document.querySelector('.user-chip .role');
  if (avatar) avatar.textContent = u.name.slice(0, 2).toUpperCase();
  if (name) name.textContent = u.name;
  if (role) role.textContent = u.label + (u.isSuper ? ' · 直通全部权限' : ` · ${u.perms.length} 项权限`);
}

function initIdentitySwitcher() {
  const sel = document.getElementById('identitySelect');
  if (!sel) return;
  sel.addEventListener('change', () => {
    CURRENT = sel.value;
    renderIdentity();
    applyMenuPermissions();
    applyActionPermissions();
    document.dispatchEvent(new CustomEvent('identity:changed', { detail: CURRENT }));
    toast(`已切换身份：${MOCK_IDENTITY[CURRENT].label}（菜单已按权限过滤）`);
  });
}

/* ---------- 验证码（Canvas 绘制，模拟后端 GET /api/v1/captcha） ---------- */
function drawCaptcha(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  canvas.dataset.code = code;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 5; i++) {                              /* 干扰线 */
    ctx.strokeStyle = `rgba(37,99,235,${0.15 + Math.random() * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {                              /* 字符 */
    ctx.save();
    ctx.font = `700 ${18 + Math.random() * 6}px Consolas, monospace`;
    ctx.fillStyle = ['#2563EB', '#0F172A', '#10B981', '#F59E0B'][i % 4];
    ctx.translate(14 + i * 24, canvas.height / 2 + 6);
    ctx.rotate((Math.random() - 0.5) * 0.5);
    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }
}

/* ---------- 页面初始化 ---------- */
function initShell(activeKey) {
  applyMenuPermissions();
  applyActionPermissions();
  renderIdentity();
  initIdentitySwitcher();
  /* 当前导航高亮 */
  if (activeKey) {
    const link = document.querySelector(`.sidebar-nav a[data-key="${activeKey}"]`);
    if (link) link.classList.add('active');
  }
  /* 弹窗关闭按钮 */
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });
}
