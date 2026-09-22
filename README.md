# 文物修复档案协作平台

面向博物馆修复团队的文物病害记录、修复方案、影像版本和审批归档平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20110>

后端健康检查：<http://localhost:21110/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | NestJS + TypeScript + Prisma |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `relic-restore`
- `FRONTEND_PORT`: 前端端口，默认 `20110`
- `BACKEND_PORT`: 后端端口，默认 `21110`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: relic-restore`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-relic-restore}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- RelicCondition: constants/RelicCondition、types/RelicCondition、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- PlanApprovalStatus: constants/PlanApprovalStatus、types/PlanApprovalStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- DamageSeverity: constants/DamageSeverity、types/DamageSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- StepStatus（PENDING/IN_PROGRESS/COMPLETED）：
  - 后端：`backend/src/constants/StepStatus.ts`、`models/RestorationStep.ts`、`seed.ts`、`services/RestorationStepService.ts`、`constructors/RestorationStepDtoFactory.ts`、`database/init.sql`（CHECK 约束）。
  - 前端：`frontend/src/constants/StepStatus.ts`、`types/RestorationStep.ts`、`utils/formatters.ts`、`components/common/StatusBadge.tsx`、`components/common/StepList.tsx`、`constructors/RestorationStepConstructor.ts`。
- Role（RESTORER/EXPERT/ARCHIVIST/VISITOR）：
  - 后端：`constants/Role.ts`、`models/User.ts`、`middlewares/authMiddleware.ts`、`middlewares/rbacMiddleware.ts`、全部 `routes/*Routes.ts` 的 `rbacMiddleware([...])`、`seed.ts`、`database/init.sql`。
  - 前端：`constants/Role.ts`、`types/Auth.ts`、`stores/AuthStore.ts`、`hooks/usePlanApproval.ts`、`pages/LoginPage.tsx`、`main.tsx`。
- ApprovalAction（SUBMIT/APPROVE/REJECT/RESUBMIT/ARCHIVE）：
  - 后端：`constants/ApprovalAction.ts`（含状态机 `ApprovalTransition`）、`models/RestorationPlan.ts`（ApprovalRecord）、`services/RestorationPlanService.ts`、`constructors/ApprovalRecordDtoFactory.ts`、`constants/logTemplates.ts`。
  - 前端：`constants/ApprovalAction.ts`、`types/RestorationPlan.ts`、`hooks/usePlanApproval.ts`、`components/common/ApprovalTimeline.tsx`。

## 修复方案审批与执行链（可追溯规则）

一条不可绕过的链路，所有越权或跳过审批的操作都会返回明确错误码与原因：

| 环节 | 角色 | 规则 | 失败错误码 |
|---|---|---|---|
| 编制/修订方案 | 修复师（仅 owner） | 仅 DRAFT/REJECTED 可改 | `RBAC_DENIED` / `PLAN_EDIT_LOCKED` |
| 送审 / 重新送审 | 修复师（仅 owner） | DRAFT→SUBMITTED；REJECTED→SUBMITTED（版本 +1） | `PLAN_EDIT_LOCKED` |
| 审批通过 | 专家 | 仅 SUBMITTED 可通过，通过后才可登记/执行步骤 | `PLAN_NOT_SUBMITTED` / `RBAC_DENIED` |
| 退回方案 | 专家 | 仅 SUBMITTED 可退回且**退回原因必填**；既有步骤全部保留但立即冻结 | `PLAN_NOT_SUBMITTED` / `PLAN_REJECTION_REASON_REQUIRED` |
| 登记步骤 | 修复师 | 方案必须 APPROVED | `STEP_REGISTER_LOCKED` |
| 开始/办结步骤 | 修复师 | 严格按 step_order 顺序；退回/待审/归档期间冻结 | `STEP_EXECUTION_FROZEN` / `STEP_ORDER_BLOCKED` / `STEP_INVALID_TRANSITION` |
| 归档 | 档案员 | APPROVED 且全部步骤 COMPLETED | `PLAN_STEPS_INCOMPLETE` / `PLAN_NOT_APPROVED` |

追溯落点：

- 每次状态变化写入 `approval_record`（版本、动作、前后状态、审批人、意见、时间），接口见 `GET /api/restoration-plan/:id`，前端在「修复方案」页时间线与「文物档案」详情中展示。
- 所有写操作同时写入 `audit_log`，接口见 `GET /api/audit-log`（访客不可见）。
- 档案进度：`GET /api/relic-item/:id/archive` 与 `/api/relic-item/archives` 聚合每方案步骤进度（已完成/执行中/待执行、百分比、是否冻结）。
- 演示账号（口令统一 `relic123`）：`restorer` 修复师 / `expert` 专家 / `archivist` 档案员 / `visitor` 访客。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
