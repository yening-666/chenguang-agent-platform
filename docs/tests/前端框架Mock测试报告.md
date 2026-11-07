# 前端项目框架 Mock 测试报告（框架阶段补交）

| 项目 | 内容 |
| --- | --- |
| 文档版本 | v1.0（补交） |
| 报告日期 | 2026-11-08 |
| 阶段 | Vue3 + TS + Pinia + Vue-Router 前端工程化框架搭建 |
| 测试框架 | Vitest 3.2.7 + axios-mock-adapter + @vue/test-utils |
| 关联文档 | `docs/tests/rbac/RBAC模块Mock测试报告.md`（RBAC 模块阶段完整报告） |
| 结论 | **通过** |

> 说明：框架搭建阶段已完成测试代码与验证，但报告文件未落盘；本文件为补交的框架阶段基线记录。RBAC 模块开发阶段在同一框架上扩展了测试集，**当前仓库的实际状态以 RBAC 报告中的 20 文件 / 105 用例 / 86.79% 行覆盖率为准**。

---

## 一、框架分层与测试落点

框架严格按前端工程化分层，每层均有对应 mock 测试：

| 层 | 目录 | 职责 | 测试落点 |
| --- | --- | --- | --- |
| apis | `src/apis/` | axios 实例、请求/响应拦截、统一 `request` 出口、各业务 API | `tests/apis/http.test.ts` |
| services | `src/services/` | 参数规整、排序分组、业务契约 | `tests/services/*.test.ts` |
| router | `src/router/` | 路由表 + 登录态/权限守卫 | `tests/router/guards.test.ts` |
| store | `src/store/` | Pinia 状态封装 | `tests/store/*.test.ts` |
| pages | `src/pages/` | 页面组件 | `tests/components/*.test.ts` |
| components | `src/components/` | 公共组件 | `tests/components/*.test.ts` |

配套设施：`src/mock/`（账号、数据仓库、27 条 handler）、`tests/helpers/mock-server.ts`（共享测试基座）。

## 二、框架阶段基线结果

| 项 | 结果 |
| --- | --- |
| 测试文件 / 用例 | 10 个文件 / 34 个用例，全部通过 |
| 覆盖内容 | http 封装（解包、ApiError、Token 拦截器、4 种请求出口）、4 个 service、auth/user store、StatusTag/AppLayout/UserPage 组件 |
| 生产构建 | `vue-tsc --noEmit` + `vite build` 通过 |
| dev server | `http://127.0.0.1:5174/` HTTP 200 |

框架阶段曾定位并修复三类测试缺陷：

1. **组件外调用 store 缺少 `setActivePinia`** → 统一在测试基座中创建独立 Pinia 实例；
2. **仅创建 `MockAdapter` 未注册 handler** 导致请求穿透 → 抽取 `registerMockHandlers()`，生产 mock 与测试共用同一路由表；
3. **组件测试出现双 Pinia 实例 / AppLayout 嵌套渲染两份菜单** → 挂载时复用同一实例，并把 AppLayout 从测试路由的 matched[0] 中移除。

## 三、RBAC 阶段扩展后的最终状态

| 指标 | 数值 |
| --- | --- |
| 测试文件 / 用例 | **20 / 105，100% 通过** |
| 全 API 覆盖 | **27 / 27**（自动化集合断言） |
| 行 / 分支 / 函数覆盖率 | **86.79% / 88.53% / 77.69%** |
| apis 层业务文件 | 100% 行覆盖 |
| services / store/modules | 98.25% / 99.46% 行覆盖 |
| E2E 冒烟 | 7 张页面截图，全部正常渲染 |

## 四、复现命令

```bash
cd frontend
npm test                 # 全量 mock 测试
npm run test:coverage    # 覆盖率（frontend/coverage/index.html）
npm run build            # 类型检查 + 生产构建
```

详见 `docs/tests/rbac/RBAC模块Mock测试报告.md` 第五至七节的完整矩阵与覆盖率明细。
