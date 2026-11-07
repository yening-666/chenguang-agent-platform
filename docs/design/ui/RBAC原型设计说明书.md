# RBAC 授权功能 — UI 原型设计说明书

| 项 | 内容 |
|----|------|
| 文档版本 | V1.0 |
| 编写日期 | 2026-11-07 |
| 需求依据 | `docs/spec/PROJECT_SPEC_V2.md`（RBAC 授权功能 PRD V2.0） |
| 原型产物 | `docs/ui/rbac/`（静态页面 + 图片两套资产） |
| 设计体系 | 完全对齐 `docs/ui/v1_dashboard.html` 既有设计 token |
| 产物性质 | 纯 HTML + CSS + JavaScript 原型，无后端依赖，双击即可交互 |

---

## 一、产物清单

### 1.1 第一套资产：静态页面（HTML + CSS + JS）

```
docs/ui/rbac/
├── login.html            # 登录页（含 Canvas 验证码）
├── dashboard.html        # 工作台（鉴权矩阵摘要 + 权限变更时间线）
├── users.html            # 用户管理（分配角色弹窗）
├── roles.html            # 角色管理（按模块分组分配权限弹窗，FR-7 核心）
├── permissions.html      # 权限管理（模块分组筛选，FR-7 / FR-1）
├── 403.html              # 无权限页（FR-5）
└── assets/
    ├── css/rbac.css      # 共享样式（设计 token + 全部组件）
    └── js/rbac-common.js # 共享逻辑（权限数据、菜单过滤、身份切换、验证码）
```

### 1.2 第二套资产：页面图片（1440×900 PNG）

```
docs/ui/rbac/images/
├── login.png             # 登录页
├── dashboard.png         # 工作台
├── users.png             # 用户管理
├── roles.png             # 角色管理
├── permissions.png       # 权限管理
└── 403.png               # 无权限页
```

图片由 Edge 无头浏览器对静态页面截图生成（`--headless=new --window-size=1440,900`），与静态页面内容一一对应，用于评审汇报与需求文档配图。

---

## 二、设计体系

### 2.1 设计 Token（与 v1_dashboard.html 完全一致）

| Token | 值 | 用途 |
|-------|-----|------|
| `--sidebar-dark` | `#0F172A` | 侧边栏底色 |
| `--sidebar-active` | `#2563EB` | 侧边栏激活项 / 主色 |
| `--main-bg` | `#F1F5F9` | 页面背景 |
| `--card` | `#FFFFFF` | 卡片 |
| `--border` | `#E2E8F0` | 边框 |
| `--text` / `--text-muted` | `#1E293B` / `#64748B` | 主文字 / 次要文字 |
| `--success` / `--warning` / `--danger` | `#10B981` / `#F59E0B` / `#EF4444` | 语义色 |

### 2.2 模块标签色（权限页 module 徽章，颜色区分）

`user` 蓝 / `role` 紫 / `permission` 绿 / `knowledge` 琥珀 / `agent` 粉 / `model` 青 / `prompt` 橙 / `tool` 靛 / `provider` 灰。

### 2.3 布局结构

- 侧边栏固定 240px，深色，分组标题（概览 / 业务管理 / 系统管理）
- 顶栏 64px：面包屑 + **权限演示身份切换器** + 用户信息
- 内容区：统计卡片（stat-grid）+ 卡片表格（card + table）+ 弹窗（modal）

---

## 三、页面设计与交互说明

### 3.1 登录页（login.html）

- 居中卡片，渐变背景；用户名 / 密码 / **Canvas 绘制的 4 位验证码**（点击刷新）
- 模拟后端 `GET /api/v1/captcha`：验证码生成 + 5 分钟过期语义在提示文案中说明
- Mock 登录：按用户名匹配内置身份（admin / sysadmin / viewer），校验验证码后携带 `?identity=` 参数跳转工作台
- **对应 PRD**：认证链路（登录 + 验证码）为授权的前置

### 3.2 工作台（dashboard.html）

- 统计卡片：当前身份持有权限数（随身份切换联动）、系统管理接口鉴权覆盖 21/21（FR-2）、业务接口待挂接 52、近 7 日 403 拒绝（FR-8）
- **接口鉴权矩阵摘要表**：模块徽章 + 接口示例 + 权限码 + 状态（已覆盖 / 待挂接），内容对齐 PRD 第八节
- **最近权限变更时间线**：演示 FR-4 缓存精确失效的触发场景（角色分配权限、用户调整角色、权限码变更）
- **对应 PRD**：FR-2（鉴权覆盖）、FR-4（缓存失效）、FR-8（拒绝审计）

### 3.3 用户管理（users.html）

- 列表：ID / 用户名 / 邮箱 / 角色徽章 / 状态 / 最后登录 / 操作
- **分配角色弹窗**：角色勾选，说明保存后调用 `PUT /users/{id}/roles` 并失效该用户权限缓存
- **创建用户弹窗**：用户名 / 邮箱 / 初始密码（bcrypt 语义提示）/ 初始角色
- 操作按钮带 `data-action-perm` 权限声明：**切换到无权限身份后按钮自动禁用**，悬停提示缺失权限码
- **对应 PRD**：FR-2（`user:list`）、FR-3（`user:assign_roles` 等按钮级声明）、FR-4（角色变更 → 缓存失效）

### 3.4 角色管理（roles.html）— FR-7 核心演示页

- 列表：角色编码 / 名称 / 权限数 / 用户数 / 类型（系统内置不可删除，删除按钮禁用）
- **分配权限弹窗（modal-lg）**：权限**按模块分组**展示（user / role / permission / knowledge / agent 五组），每组含模块徽章、权限数、「全选」切换；每项展示名称 + 权限码（等宽字体）
- 保存语义提示：调用 `PUT /roles/{id}/permissions` 后精确失效该角色全部用户缓存
- **对应 PRD**：FR-7（分组分配权限）、FR-3（`role:assign_permissions`）、FR-6（系统内置角色保护）

### 3.5 权限管理（permissions.html）

- 统计卡片：权限总数 32 / 模块数 9 / 接口已挂接 21 / 待挂接 11
- **模块筛选下拉**：按 module 过滤表格行（前端交互演示 FR-7）
- 列表：权限编码（等宽字体）/ 名称 / 模块徽章 / 接口挂接状态（已挂接 N 个接口 / 待挂接）/ 描述
- **创建权限弹窗**：模块 + 操作两步选择 → 权限码自动拼接 `模块:操作`（创建后不可修改，FR-1 约定）
- **对应 PRD**：FR-1（module 字段 + 权限码规范）、FR-7（模块筛选与维护）、FR-8（删除前接口引用检查提示）

### 3.6 无权限页（403.html）

- 独立页面（无侧边栏）：大号 403 + 缺失权限码展示（支持 `?perm=xxx` 参数演示）
- 说明后端语义（HTTP 200 + 业务码 403，对齐 BizException 约定 / 开放问题 Q2）与前端处理（apiClient 统一识别 → 跳转本页），并注明拒绝已写入审计日志（FR-8）
- **对应 PRD**：FR-5（403 页面与统一处理）

---

## 四、权限映射（原型 ← → PRD 鉴权矩阵）

### 4.1 菜单级（侧边栏显隐，FR-5）

| 菜单 | 权限码（data-perm） |
|------|---------------------|
| 工作台 | 登录即可 |
| Agent 管理 | `agent:list` |
| 模型管理 | `model:list`（`provider:list`） |
| Prompt 管理 | `prompt:list` |
| 知识库 | `knowledge:list` |
| 工具管理 | `tool:list` |
| 用户管理 | `user:list` |
| 角色管理 | `role:list` |
| 权限管理 | `permission:list` |

每个菜单项右侧以灰色徽章展示所需权限码，直观呈现"菜单 = 权限码入口"的设计约定。

### 4.2 按钮级（体验层演示）

操作按钮通过 `data-action-perm` 声明权限码（如 `user:create`、`user:assign_roles`、`role:assign_permissions`、`permission:delete`），无权限身份下自动禁用并提示缺失权限码。**按钮级控制仅为体验层，安全边界始终在后端 `require_permission`（PRD 3.1 方案 A）**。

### 4.3 身份切换演示数据

| 身份 | 权限集合 |
|------|---------|
| 超级管理员 admin | `is_superuser` 直通全部（32 项权限码） |
| 系统管理员 sysadmin | 23 项（user/role/permission 全量 + 业务模块只读） |
| 普通用户 viewer | 9 项（各模块 `*:list` 只读） |

切换身份时联动：侧边栏菜单显隐、操作按钮禁用、工作台权限数统计，完整演示 PRD FR-3 / FR-5 的前端行为。

---

## 五、实现说明

- **零依赖**：纯 HTML/CSS/JS，无框架、无构建、无网络请求，双击 `login.html` 即可开始体验
- **数据 Mock**：权限码清单（`PERMS`）与模拟身份（`MOCK_IDENTITY`）内置于 `rbac-common.js`，权限码与 PRD 第八节鉴权矩阵严格一致
- **Canvas 验证码**：随机 4 位字符 + 干扰线，模拟后端验证码接口行为
- **图片产物生成方式**：Edge 无头浏览器 `--headless=new --window-size=1440,900 --screenshot`，页面 JS 先行执行后截图，内容与静态页面一致
- **一致性**：设计 token、布局结构、组件样式与 `docs/ui/v1_dashboard.html` 系列 V1–V9 原型完全同源，可直接并入现有原型体系

---

## 六、与 PRD 的需求追溯

| PRD 条目 | 原型落点 |
|----------|---------|
| FR-1 权限模型增强（module 字段） | permissions.html（模块徽章、创建权限弹窗模块选择） |
| FR-2 接口认证全覆盖 | dashboard.html（鉴权矩阵摘要 21/21）、各页面"接口 · 权限码"副标题 |
| FR-3 权限校验依赖 | users.html / roles.html / permissions.html 按钮禁用演示、403.html |
| FR-4 权限解析与缓存 | dashboard.html 权限变更时间线、users/roles 弹窗保存语义提示 |
| FR-5 未授权响应与前端控制 | 403.html、侧边栏按权限显隐、身份切换器 |
| FR-6 权限数据初始化 | login.html 内置账号说明、roles.html 系统内置角色保护 |
| FR-7 权限管理页面增强 | permissions.html（模块筛选）、roles.html（分组分配权限弹窗） |
| FR-8 拒绝访问审计 | dashboard.html 403 统计卡片、403.html 审计提示 |

---

## 七、变更记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-11-07 | V1.0 | 基于 PROJECT_SPEC_V2.md 完成 RBAC 授权功能 UI 原型：6 静态页面 + 6 张页面图片 + 本说明书 |
