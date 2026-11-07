# RBAC 模块 Mock 测试报告

| 项目 | 内容 |
| --- | --- |
| 文档版本 | v1.0 |
| 报告日期 | 2026-11-08 |
| 所属项目 | 晨光 Agent 平台 — 前端 RBAC 模块 |
| 需求依据 | `docs/spec/PROJECT_SPEC_V2.md`（PRD FR-1 ~ FR-8）、`docs/design/ui/RBAC原型设计说明书.md`、`docs/ui/rbac/` 页面原型 |
| 测试范围 | 4 个页面 + apis / services / store / router / components 全链路 |
| 测试类型 | Mock 单元测试、组件测试、路由守卫测试、接口全量覆盖测试、E2E 冒烟验证 |
| 最终结论 | **通过**（20 个测试文件 / 105 个用例，100% 通过；27/27 API 全覆盖） |

---

## 一、测试结论摘要

| 指标 | 结果 |
| --- | --- |
| 测试用例 | **105 / 105 通过**，20 个测试文件，执行耗时约 4s |
| 全 API 覆盖 | **27 / 27 条接口全部被调用验证**（自动化断言，无遗漏） |
| 业务 API 文件行覆盖率 | **100%**（6 个 `*.api.ts` 文件） |
| apis 层整体 | 97.00% 行 / 100% 函数 / 91.49% 分支（含 `http.ts` 94.11%） |
| services 层 | 98.25% 行 / 96.30% 函数 / **100% 分支** |
| store/modules 层 | 99.46% 行 / **100% 函数** / 97.62% 分支 |
| 全量代码覆盖率 | **86.79% 行**（1361/1568）/ 88.53% 分支 / 77.69% 函数 |
| 生产构建 | `vue-tsc --noEmit` + `vite build` **通过** |
| E2E 冒烟 | 7 个页面截图全部正常渲染，403 权限拦截生效 |
| 失败用例 / 遗留缺陷 | 0 / 0 |

> 结论：RBAC 模块（用户管理、角色管理、权限管理、菜单路由权限）的**接口层、业务逻辑层、状态层、路由守卫层、页面交互层**均已通过 mock 测试验证，满足「全 API 覆盖测试」要求，可进入与真实后端联调阶段。

---

## 二、测试对象与交付范围

### 2.1 四个页面（本轮开发）

| 页面 | 文件 | 核心能力 |
| --- | --- | --- |
| 用户管理 | `src/pages/system/UserPage.vue` | 分页列表、搜索、启停、分配角色弹窗、删除 |
| 角色管理 | `src/pages/system/RolePage.vue` | 角色 CRUD、**按 module 分组的分配权限弹窗**（FR-7） |
| 权限管理 | `src/pages/system/PermissionPage.vue` | 按 module 分组展示、权限 CRUD、`模块:操作` 权限码 |
| 菜单路由权限 | `src/pages/system/MenuPage.vue` | 路由 × 权限码 × 菜单显隐 × 当前用户可访问性矩阵（FR-3） |

### 2.2 配套分层产物

| 层 | 新增/增强文件 |
| --- | --- |
| apis | `user.api.ts`(9)、`role.api.ts`(7)、`permission.api.ts`(6)、`menu.api.ts`(1)；另有 `auth.api.ts`(3)、`dashboard.api.ts`(1)、`http.ts` |
| services | `user/role/permission/menu.service.ts`、`dashboard.service.ts`、`auth.service.ts` |
| store | `user/role/permission/menu.store.ts`、`auth.store.ts` |
| router | `router/index.ts`（新增 `system/menus` 路由）、`router/guards.ts`（登录态 + 权限守卫） |
| components | `AppLayout.vue`（5 项菜单按权限过滤）、`StatusTag.vue`、`EmptyState.vue` |
| mock | `mock/handlers.ts`（**27 条 handler，生产 mock 与测试共用同一路由表**）、`mock/data.ts`（深拷贝数据仓库）、`mock/accounts.ts`（3 个演示账号） |

---

## 三、测试环境

| 项 | 版本 / 值 |
| --- | --- |
| OS | Windows 11 |
| Node.js | v22.22.2 |
| npm | 10.9.7 |
| 前端框架 | Vue 3 + TypeScript + Pinia + Vue Router 4 + Vite 6 |
| 测试框架 | Vitest 3.2.7（`environment: node`，组件测试用 `jsdom` docblock） |
| 覆盖率 | `@vitest/coverage-v8@3.2.7`（v8 provider） |
| Mock 方案 | `axios-mock-adapter@2.1.0`，`onNoMatch: throwException` |
| 组件挂载 | `@vue/test-utils` |
| E2E 截图 | Microsoft Edge `--headless=new --virtual-time-budget=8000`，1440×900 |
| 命令 | `npm test` / `npm run test:coverage` / `npm run build` |

---

## 四、测试策略

### 4.1 共享 mock 基座

`tests/helpers/mock-server.ts` 为所有用例提供统一基座，解决三个工程问题：

1. **零污染**：每个用例独立 `createPinia()` + `createMockStore()`（深拷贝初始数据），写操作互不干扰；
2. **同源路由表**：测试与生产 mock 共用 `registerMockHandlers()`，避免"测试通过但页面 mock 行为不一致"；
3. **遗漏即刻暴露**：`onNoMatch: 'throwException'`，任何未注册的接口调用会立即失败，而不是静默 404。

默认以超级管理员 `Bearer mock-token-admin` 发起请求；`loginAs()` 可切换账号。

### 4.2 测试金字塔

```
E2E 冒烟（7 张截图，dev server + headless Edge）
        ↑
组件/交互测试（23 用例：页面渲染、按钮级权限、弹窗提交链路）
        ↑
路由守卫测试（7 用例：登录态、401/403 语义、标题）
        ↑
store 测试（11 用例：状态流转、computed 矩阵、CRUD 后刷新）
        ↑
services 测试（21 用例：参数规整、排序分组、业务契约）
        ↑
apis 测试（43 用例：27 条接口 × 成功/异常分支 + 全量覆盖矩阵断言）
```

### 4.3 「全 API 覆盖」的机器校验

`tests/apis/api-coverage.test.ts` 不是靠人工清单声明覆盖，而是**逐条真实调用全部 27 个 API 方法**，再从 `mock.history` 中收集实际发出的请求，归一化路径（`/users/1` → `/users/{id}`）后与期望清单做集合比对：

```ts
const missing = API_MATRIX.filter(item => !actual.has(`${item.method} ${item.path}`))
expect(missing).toEqual([])
expect(actual.size).toBe(27)
```

清单同时校验「27 条无重复」与「11 条业务写操作全部带 `模块:操作` 权限码」。

---

## 五、全 API 覆盖矩阵（27 / 27）

| # | 方法 | 路径 | 所需权限码 | API 方法 | 覆盖情况 |
| --- | --- | --- | --- | --- | --- |
| 1 | POST | `/auth/login` | 公开 | `authApi.login` | ✅ 成功 / 密码错误 / 账号不存在 |
| 2 | POST | `/auth/logout` | 登录即可 | `authApi.logout` | ✅ |
| 3 | GET | `/auth/profile` | 登录即可 | `authApi.profile` | ✅ 有效 token / 未登录 401 |
| 4 | GET | `/users/me` | 登录即可 | `userApi.me` | ✅ |
| 5 | GET | `/users/search` | `user:list` | `userApi.search` | ✅ 命中 / 空关键字 |
| 6 | GET | `/users` | `user:list` | `userApi.page` | ✅ 分页 / 关键字 / 第二页 |
| 7 | GET | `/users/{id}` | `user:read` | `userApi.getById` | ✅ 存在 / 1005 |
| 8 | GET | `/users/{id}/roles` | `user:read` | `userApi.getRoles` | ✅ |
| 9 | POST | `/users` | `user:create` | `userApi.create` | ✅ 创建 / 重名 1002 |
| 10 | PUT | `/users/{id}` | `user:update` | `userApi.update` | ✅ 昵称 + 状态 |
| 11 | PUT | `/users/{id}/roles` | `user:assign_roles` | `userApi.assignRoles` | ✅ 角色同步 |
| 12 | DELETE | `/users/{id}` | `user:delete` | `userApi.remove` | ✅ 删除 / 重复删除 1005 |
| 13 | GET | `/roles/search` | `role:list` | `roleApi.search` | ✅ 命中 / 空关键字 |
| 14 | GET | `/roles` | `role:list` | `roleApi.list` | ✅ |
| 15 | GET | `/roles/{id}` | `role:read` | `roleApi.getById` | ✅ 存在 / 1005 |
| 16 | POST | `/roles` | `role:create` | `roleApi.create` | ✅ 创建 / 编码重复 1003 |
| 17 | PUT | `/roles/{id}` | `role:update` | `roleApi.update` | ✅ 名称 / 描述 / 状态 |
| 18 | PUT | `/roles/{id}/permissions` | `role:assign_permissions` | `roleApi.assignPermissions` | ✅ 权限 ID 列表落库 |
| 19 | DELETE | `/roles/{id}` | `role:delete` | `roleApi.remove` | ✅ 删除 / 1005 |
| 20 | GET | `/permissions/search` | `permission:list` | `permissionApi.search` | ✅ 权限码过滤 / 空关键字 |
| 21 | GET | `/permissions` | `permission:list` | `permissionApi.list` | ✅ 扁平表 + 权限码规范校验 |
| 22 | GET | `/permissions/{id}` | `permission:read` | `permissionApi.getById` | ✅ 存在 / 1005 |
| 23 | POST | `/permissions` | `permission:create` | `permissionApi.create` | ✅ 创建 / 权限码重复 1004 |
| 24 | PUT | `/permissions/{id}` | `permission:update` | `permissionApi.update` | ✅ 名称 / 状态 |
| 25 | DELETE | `/permissions/{id}` | `permission:delete` | `permissionApi.remove` | ✅ 删除 / 1005 |
| 26 | GET | `/menus` | 登录即可 | `menuApi.list` | ✅ 8 条矩阵 / 5 条菜单可见 / 3 条公开 |
| 27 | GET | `/dashboard/stats` | `dashboard:view` | `dashboardApi.stats` | ✅ 四项统计 |

**统计**：认证 3 + 用户 9 + 角色 7 + 权限 6 + 菜单 1 + 工作台 1 = **27 条，覆盖率 100%**。业务写操作 11 条全部映射到 PRD 鉴权矩阵的具体权限码。

---

## 六、测试用例清单（20 文件 / 105 用例）

| 层 | 测试文件 | 用例数 | 覆盖重点 |
| --- | --- | --- | --- |
| apis | `apis/http.test.ts` | 5 | 响应解包、ApiError、拦截器 Token、4 种请求出口 |
| apis | `apis/api-coverage.test.ts` | 3 | **27 条接口机器校验**、清单去重、写操作权限码 |
| apis | `apis/auth.api.test.ts` | 6 | 登录成功/失败、logout、profile 401 |
| apis | `apis/user.api.test.ts` | 12 | 9 条接口 + 分页边界 + 重名 + 数据隔离 |
| apis | `apis/role.api.test.ts` | 7 | 7 条接口 + 编码重复 + 分配权限 |
| apis | `apis/permission.api.test.ts` | 6 | 6 条接口 + 权限码规范 + 编码重复 |
| apis | `apis/menu.dashboard.api.test.ts` | 4 | 路由矩阵、菜单显隐、公开路由、统计 |
| services | `services/auth.service.test.ts` | 4 | 参数校验、登录契约 |
| services | `services/user.service.test.ts` | 6 | 参数规整（page 兜底、keyword trim） |
| services | `services/role.service.test.ts` | 2 | 列表按 id 升序、空列表 |
| services | `services/permission.service.test.ts` | 3 | 分组排序、搜索 |
| services | `services/rbac-services.test.ts` | 6 | **5 个 service 全部方法**一次覆盖 |
| store | `store/auth.store.test.ts` | 5 | 登录态、`*` 超管权限、登出、setSession |
| store | `store/rbac-stores.test.ts` | 6 | 4 个 store 全部方法、groups 分组、matrix 可访问性 |
| router | `router/guards.test.ts` | 7 | 未登录重定向、403 + 缺失权限码、超管放行、页面标题 |
| components | `components/StatusTag.test.ts` | 2 | 状态标签渲染 |
| components | `components/AppLayout.test.ts` | 4 | 菜单按权限过滤（超管/系统管理员/访客）、用户信息 |
| components | `components/UserPage.test.ts` | 3 | 用户列表渲染与权限按钮 |
| components | `components/rbac-pages.test.ts` | 6 | **4 个 RBAC 页面**渲染 + 按钮级权限 + 403 页面 |
| components | `components/rbac-interactions.test.ts` | 8 | 登录跳转/失败、工作台统计、404、角色与权限弹窗提交链路 |
| **合计** | **20 文件** | **105** | **全部通过** |

---

## 七、代码覆盖率报告

采集命令：`npm run test:coverage`（v8 provider，`reporter: text / json-summary / html`，输出目录 `frontend/coverage/`，已加入 `.gitignore`）。

### 7.1 总体

| 指标 | 覆盖 / 总数 | 百分比 |
| --- | --- | --- |
| 语句 / 行 | 1361 / 1568 | **86.79%** |
| 分支 | 309 / 349 | **88.53%** |
| 函数 | 101 / 130 | **77.69%** |

### 7.2 分层明细

| 层 / 目录 | 行覆盖率 | 函数覆盖率 | 分支覆盖率 | 说明 |
| --- | --- | --- | --- | --- |
| `src/apis` | 97.00% | 100% | 91.49% | 6 个业务 API 文件 **100%**；`http.ts` 94.11%（401 跳转分支依赖浏览器 window） |
| `src/services` | 98.25% | 96.30% | **100%** | `auth.service.ts` 88.88%（profile 空校验分支） |
| `src/store/modules` | 99.46% | **100%** | 97.62% | 5 个 store 近乎全覆盖 |
| `src/pages/system` | 84.53% | 33.33% | 80.00% | 未覆盖为弹窗「取消/关闭」、编辑/删除按钮等次要交互分支 |
| `src/pages/login` | 100% | 100% | 71.43% | 登录成功/失败链路均覆盖 |
| `src/pages/dashboard` | 95.92% | — | 25.00% | 错误兜底分支未触发 |
| `src/pages/error` | 100% | — | 33.33% | 403 有/无 `perm` 参数分支之一未触发 |
| `src/components/common` | 100% | — | 85.71% | — |
| `src/components/layout` | 91.49% | 0% | 40.00% | `handleLogout` 未被点击（属 E2E 范畴） |
| `src/mock` | 94.78% | 83.33% | 96.58% | `mock/index.ts` 为 Vite 环境装配入口，单测不直接执行 |
| `src/router` | 16.67% | 50.00% | 64.29% | `guards.ts` 75%；`router/index.ts` 为 `createWebHistory` 装配入口（需要浏览器 E2E） |

### 7.3 未覆盖项说明（不构成缺陷）

- `router/index.ts` / `store/index.ts` / `mock/index.ts` 属**应用装配代码**，只在浏览器启动时执行，单测不直接 import；其行为已由 7 张 E2E 截图间接验证。
- `http.ts` 的 401 → `window.location.href = '/login'` 分支在 `node` 环境无 `window`，由设计跳过；守卫层已用 401/403 语义测试覆盖。
- 页面「取消弹窗」「删除确认」等次要交互分支，已由正向提交链路与 API 层删除用例覆盖核心逻辑。

> **关键结论**：所有承载权限判定与数据读写的层（apis / services / store / guards）均达到 97% 以上行覆盖率与 96% 以上函数覆盖率；未覆盖部分集中在纯展示与装配代码。

---

## 八、关键场景验证

| 场景 | 对应需求 | 验证方式 | 结果 |
| --- | --- | --- | --- |
| 未登录访问受保护页 | FR-3 | 守卫测试断言重定向 `/login?redirect=...` | ✅ |
| 已登录但缺少权限码 | FR-5 | 断言跳转 `/403?perm=role:list` / `user:list` | ✅ |
| 超管 `*` 权限放行 | FR-1 | 守卫 + 页面 + store matrix 三重验证 | ✅ |
| 前端菜单按权限显隐 | FR-3 | AppLayout 组件测试（5 项 / 1 项） + 截图 | ✅ |
| 按钮级权限控制 | FR-5 | 访客身份下「新增角色」「新增权限」按钮消失 | ✅ |
| 角色按模块分组分配权限 | FR-7 | 弹窗渲染 4 个分组 → 勾选 → 确认 → 落库断言 | ✅ |
| 权限码 `模块:操作` 规范 | FR-1 | 正则校验全部 10 条初始权限码 | ✅ |
| 用户分配角色 | FR-2 | API + service + store 三层断言角色名同步 | ✅ |
| 业务错误码 1001~1005 | FR-8 | 登录失败、重名、编码重复、资源不存在逐项断言 | ✅ |
| 缓存/数据隔离 | FR-4 | 每用例独立仓库，末条用例断言初始数据仍为 5 用户 | ✅ |
| 菜单路由矩阵 | FR-3 | 8 条路由、5 个权限码、3 条公开路由、访客 4 条不可访问 | ✅ |

---

## 九、E2E 冒烟验证

以 `npm run dev -- --port 5174 --strictPort` 启动 Vite dev server，使用 `?mockToken=...` 直登演示账号，Edge 无头模式（`--virtual-time-budget=8000` 等待 Vue 挂载完成）逐页截图，产物位于 `docs/tests/rbac/images/`：

| 截图 | 页面 | 身份 | 目检结论 |
| --- | --- | --- | --- |
| `01-login.png` | 登录页 | 匿名 | 表单与演示账号提示正常 |
| `02-dashboard.png` | 工作台 | 超管 | 统计卡片、权限徽章正常 |
| `03-users.png` | 用户管理 | 超管 | 用户表格、操作按钮正常 |
| `04-roles.png` | 角色管理 | 超管 | 角色表格、权限码标签正常 |
| `05-permissions.png` | 权限管理 | 超管 | 按模块分组表格正常 |
| `06-menus.png` | 菜单路由权限 | 超管 | **已人工目检**：深色侧边栏、8 行路由矩阵、权限码标签、可访问徽章全部正常 |
| `07-forbidden.png` | 403 无权限页 | 访客 | 访问 `/system/users` 被拦截，展示缺失权限码 |

> 首次截图曾出现空白页（JS 未执行完即截屏），通过 `--virtual-time-budget=8000` 修正；7 张最终产物均已确认非空白。

---

## 十、构建与类型检查

```
npm run build  →  vue-tsc --noEmit ✓  →  vite build ✓ built in 1.84s
```

产物按页面拆分为独立 chunk（`UserPage` 5.14 kB、`RolePage` 4.91 kB、`PermissionPage` 3.81 kB、`MenuPage` 2.13 kB 等），主包 165.40 kB（gzip 63.23 kB），路由懒加载生效。

---

## 十一、已知限制与后续建议

1. **Mock 与真实后端契约待联调**：本报告全部基于 `axios-mock-adapter`；真实后端接口路径、分页字段、错误码需联调时逐项核对（PRD 第八节矩阵已作为契约基准）。
2. **前端权限仅作体验层**：菜单/按钮显隐不是安全边界，后端 `require_permission` 校验（FR-1 / FR-6）仍需按 PRD 实现，否则存在越权风险。
3. **覆盖率统计口径**：`router/index.ts` 等装配入口未纳入单测，导致 router 目录数值偏低；如需提升可引入 Playwright/E2E 覆盖率采集。
4. **FR-4 缓存失效**：mock 环境无 Redis，权限变更后的缓存失效行为仅验证了数据刷新链路，需在后端接入后补测。

---

## 十二、复现命令

```bash
cd frontend
npm install                 # 首次
npm test                     # 105 个 mock 测试
npm run test:coverage        # 覆盖率报告（frontend/coverage/index.html）
npm run build                # 类型检查 + 生产构建
npm run dev -- --port 5174   # 本地预览（?mockToken=mock-token-admin 直登）
```

演示账号（密码均为 `123456`）：`admin`（超管 `*`）、`sysadmin`（系统管理员）、`viewer`（仅 `dashboard:view`）。

---

## 附录 A：本轮新增测试产物清单

```
frontend/tests/
├── helpers/mock-server.ts                    # 共享 mock 基座
├── apis/
│   ├── api-coverage.test.ts                  # 27 条接口全量覆盖机器校验
│   ├── auth.api.test.ts
│   ├── user.api.test.ts
│   ├── role.api.test.ts
│   ├── permission.api.test.ts
│   └── menu.dashboard.api.test.ts
├── services/rbac-services.test.ts
├── store/rbac-stores.test.ts
├── router/guards.test.ts
└── components/
    ├── rbac-pages.test.ts
    └── rbac-interactions.test.ts

docs/tests/rbac/
├── RBAC模块Mock测试报告.md                    # 本文档
└── images/                                  # 7 张 E2E 冒烟截图

frontend/
├── vitest.config.ts                          # 增加 coverage 配置
├── package.json                              # 增加 test:coverage 脚本
└── .gitignore                                # 排除 node_modules / dist / coverage
```
