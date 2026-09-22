// 前端错误文案：与后端错误码对齐，越权/跳过审批时直接展示后端返回的明确失败原因
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  PLAN_NOT_FOUND: "修复方案不存在",
  STEP_NOT_FOUND: "修复步骤不存在",
  PLAN_NOT_SUBMITTABLE: "仅草稿或被退回（待整改）的方案可以送审",
  PLAN_NOT_APPROVABLE: "仅待审批（已送审）的方案可以审批通过",
  PLAN_NOT_REJECTABLE: "仅待审批（已送审）的方案可以退回",
  PLAN_NOT_ARCHIVABLE: "仅审批通过且全部步骤完成的方案可以归档",
  PLAN_APPROVAL_REQUIRED: "修复方案尚未经专家审批通过，禁止登记或执行步骤",
  PLAN_RETURNED_EXECUTION_BLOCKED: "方案已被退回待审，既有步骤保留但禁止继续执行，重新通过后按原步骤继续",
  STEP_ORDER_BLOCKED: "存在前序步骤未完成，必须按原步骤顺序执行",
  STEP_NOT_STARTABLE: "仅待执行步骤可以开始执行",
  STEP_NOT_FINISHABLE: "仅执行中的步骤可以完成",
  REJECTION_REASON_REQUIRED: "退回方案必须填写退回原因",
  PLAN_ARCHIVED_LOCKED: "方案已归档，禁止再登记或执行步骤",
  NETWORK_ERROR: "网络请求失败，请确认后端服务已启动"
} as const;
