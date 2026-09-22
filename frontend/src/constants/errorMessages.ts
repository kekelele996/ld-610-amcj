import type { ERROR_CODES } from "./errorCodes";

/** 后端错误码 -> 中文展示文案；后端 message 作为补充细节一并展示，保证失败原因明确可追溯 */
export const ERROR_MESSAGES: Record<keyof typeof ERROR_CODES, string> = {
  AUTH_REQUIRED: "未登录或登录已失效，请重新登录",
  AUTH_INVALID_CREDENTIALS: "用户名或口令不正确",
  AUTH_TOKEN_INVALID: "登录令牌无效或已过期，请重新登录",
  RBAC_DENIED: "越权操作：当前角色无权执行该动作",
  VALIDATION_FAILED: "表单校验未通过",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  PLAN_NOT_FOUND: "修复方案不存在",
  PLAN_NOT_SUBMITTED: "该方案当前不在待审批状态，无法审批",
  PLAN_NOT_APPROVED: "该方案尚未通过专家审批",
  PLAN_EDIT_LOCKED: "方案当前状态已锁定，不可编辑",
  PLAN_REJECTION_REASON_REQUIRED: "退回方案必须填写退回原因",
  PLAN_STEPS_INCOMPLETE: "仍有修复步骤未完成，不能归档",
  STEP_NOT_FOUND: "修复步骤不存在",
  STEP_REGISTER_LOCKED: "禁止登记步骤：方案尚未通过专家审批",
  STEP_EXECUTION_FROZEN: "禁止执行步骤：方案已退回待审，既有步骤已冻结",
  STEP_INVALID_TRANSITION: "步骤状态流转不合法",
  STEP_ORDER_BLOCKED: "存在未完成的前序步骤，请按步骤顺序执行",
  RELIC_NOT_FOUND: "文物档案不存在",
  INTERNAL_ERROR: "服务内部错误，请稍后再试"
};
