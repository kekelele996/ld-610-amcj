# 文物修复档案协作平台

面向博物馆修复团队的文物病害记录、修复方案、影像版本和审批归档平台。修复方案必须经过「专家通过」后修复师才能登记步骤；方案被退回待审时既有步骤保留但禁止继续执行，重新通过后按原步骤继续；全部步骤完成后由档案员归档。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

- 前端：<http://localhost:20110>
- 后端健康检查：<http://localhost:21110/health>

## 审批与执行链（核心业务规则）

方案状态 `DRAFT → SUBMITTED → APPROVED → ARCHIVED`，其中专家可在 `SUBMITTED` 阶段退回为 `REJECTED`（退回待审），修复师整改后重新 `SUBMITTED`，专家再次通过后恢复执行。

| 动作 | 接口 | 允许角色 | 状态前置条件 | 失败错误码 |
|---|---|---|---|---|
| 编制方案 | `POST /api/restoration-plan` | 修复师 | 新建恒为 DRAFT | `RBAC_DENIED` / `VALIDATION_FAILED` |
| 送审 / 重新送审 | `POST /api/restoration-plan/:id/approval` `{"action":"SUBMIT"}` | 修复师 | DRAFT、REJECTED | `PLAN_NOT_SUBMITTABLE` |
| 审批通过 | 同上 `{"action":"APPROVE"}` | 专家审批 | SUBMITTED | `RBAC_DENIED` / `PLAN_NOT_APPROVABLE` |
| 退回待审 | 同上 `{"action":"REJECT","reason":"..."}` | 专家审批 | SUBMITTED，**退回原因必填** | `REJECTION_REASON_REQUIRED` / `PLAN_NOT_REJECTABLE` |
| 登记步骤 | `POST /api/restoration-step` | 修复师 | **仅 APPROVED** | `PLAN_APPROVAL_REQUIRED` / `PLAN_RETURNED_EXECUTION_BLOCKED` |
| 开始执行 | `POST /api/restoration-step/:id/start` | 修复师 | APPROVED 且前序步骤全部完成 | `STEP_ORDER_BLOCKED` / `STEP_NOT_STARTABLE` |
| 完成质检 | `POST /api/restoration-step/:id/finish` | 修复师 | 该步骤 IN_PROGRESS | `STEP_NOT_FINISHABLE` |
| 归档 | approval `{"action":"ARCHIVE"}` | 档案员 | APPROVED 且步骤全部 FINISHED | `PLAN_NOT_ARCHIVABLE` |
| 归档后操作 | 任意步骤写操作 | — | 禁止 | `PLAN_ARCHIVED_LOCKED` |

关键保证：

1. **专家通过后才能登记步骤**：DRAFT / SUBMITTED / REJECTED 状态下登记或执行步骤一律返回 `PLAN_APPROVAL_REQUIRED` 或 `PLAN_RETURNED_EXECUTION_BLOCKED`。
2. **退回待审：步骤保留、执行冻结**：退回不会删除任何步骤，前端列表仍展示并标注冻结；任何开始/完成/登记请求都被拒绝，失败信息携带退回原因。
3. **重新通过后按原步骤继续**：重新送审并通过后，原有步骤序号与状态不变，从第一个未完成步骤继续。
4. **顺序执行**：只能开始「当前步骤」（第一个非 FINISHED 步骤），跳序返回 `STEP_ORDER_BLOCKED`。
5. **双重权限校验**：路由 `rbacMiddleware` 做粗粒度角色门禁，service 对具体动作精确校验；任何越权或跳过审批的操作都会返回 `code`（如 `RBAC_DENIED`）与中文明确失败原因，前端以失败横幅直接展示。

### 演示账号（本地 JWT 登录）

```bash
curl -s -X POST http://localhost:21110/api/auth/login \
  -H 'Content-Type: application/json' -d '{"login":"expert"}'
# login 可选：restorer(修复师) / expert(专家审批) / archivist(档案员) / visitor(访客)
```

页面左下角可直接切换角色；按钮按角色与方案状态显隐，但最终以后端校验为准。

### CLI 验证示例

```bash
TOKEN=$(curl -s -X POST http://localhost:21110/api/auth/login \
  -H 'Content-Type: application/json' -d '{"login":"restorer"}' | jq -r .token)
# 未通过审批直接登记步骤 -> 409 PLAN_APPROVAL_REQUIRED
curl -i -X POST http://localhost:21110/api/restoration-step \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"plan_id":1,"technique":"清洗"}'
```

审计日志（专家/档案员/修复师可查）：`GET /api/audit-log`。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：`cd backend && npm install && npm run dev`（接口统一挂在 `/api`，需携带 `Authorization: Bearer <token>`）

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | Express + TypeScript（分层 routes/controllers/services/repositories，中间件模式） |
| 数据库 | PostgreSQL 15（当前演示以内存数据 + 种子运行，建表脚本见 `database/init.sql`） |
| 认证 | JWT + RBAC（修复师 / 专家审批 / 档案员 / 访客） |
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
- `JWT_SECRET`: JWT 签名密钥（compose 默认 `local-dev-secret`）

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: relic-restore`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-relic-restore}` 前缀。
- 数据库使用命名卷 `db_data`，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- **RelicCondition**：`frontend/src/constants/RelicCondition.ts`、`frontend/src/types/RelicCondition.ts`、constructors、`utils/formatters.ts`、`constants/statusText.ts`、RelicInfoCard/StatusBadge 展示；后端 `backend/src/constants/RelicCondition.ts`、seed、DTO factory、formatters。
- **PlanApprovalStatus**（DRAFT/SUBMITTED/APPROVED/REJECTED/ARCHIVED）：
  - 前端：`constants/PlanApprovalStatus.ts`（含中文文案与状态提示 `PlanApprovalStatusHint`）、`types/PlanApprovalStatus.ts`、`types/RestorationPlan.ts`、`constructors/RestorationPlanConstructor.ts`、`utils/formatters.ts`（formatPlanStatus）、`constants/statusText.ts`、`constants/logTemplates.ts`、`constants/errorMessages.ts`、PlansPage 状态筛选、`components/common/PlanStatusBadge.tsx`、`components/common/RejectionNotice.tsx`、DashboardPage。
  - 后端：`constants/PlanApprovalStatus.ts`、`models/RestorationPlan.ts`、`services/RestorationPlanService.ts`（状态机）、`services/RestorationStepService.ts`（执行门禁）、`repositories/RestorationPlanRepository.ts`、`constructors/RestorationPlanDtoFactory.ts`、`constants/logTemplates.ts`、`constants/errorMessages.ts`、seed。
- **DamageSeverity**：前后端 `constants/DamageSeverity.ts`、types、constructors、formatters（formatRisk）、SeverityBadge、筛选与日志模板。
- **StepExecutionStatus**（PENDING/IN_PROGRESS/FINISHED，新增）：前后端 `constants/StepExecutionStatus.ts`、`models|types/RestorationStep`、步骤 constructor/DTO factory、`utils/progress.ts` / `utils/formatters.ts`（summarizeSteps、formatStepStatus）、StepList、StepStatusBadge、ProgressBar、步骤 service 的顺序执行校验、数据库 `restoration_step.step_status`。
- **UserRole**（RESTORER/EXPERT/ARCHIVIST/VISITOR，新增）：前后端 `constants/UserRole.ts`、`authMiddleware`、`rbacMiddleware`、`utils/auth.ts`、AuthStore、RoleSwitcher、usePlanApproval 按钮显隐、审批轨迹 `ApprovalRecord.actor_role`。
- **错误码**：前后端 `constants/errorCodes.ts` 与 `constants/errorMessages.ts` 一一对应，后端 `utils/errors.ts` 抛出、`errorHandlerMiddleware` 统一输出，前端 `api/client.ts` 解析并在 store/页面展示。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录。本次审批链改动即同时触达：数据库表结构（退回原因、审批记录表、步骤时间字段）、后端枚举/错误码/错误消息/日志模板、model、repository、service（状态机与执行门禁）、controller、route（RBAC）、DTO factory、前端类型/常量/构造器/formatter、api/store/hook、ApprovalTimeline/StepList/RejectionNotice/ProgressBar 等组件、PlansPage/DashboardPage/RelicsPage 与 README——任何单点遗漏都会在类型检查或运行期失败。

## License

MIT
