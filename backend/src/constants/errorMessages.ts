import type { ERROR_CODES } from "./errorCodes";

/**
 * 错误消息模板集中存放。模板中的 {placeholder} 由 utils/formatters.renderTemplate 填充。
 * service 与 controller 必须分别包装异常，禁止只在 errorHandlerMiddleware 中吞掉。
 */
export const ERROR_MESSAGES: Record<keyof typeof ERROR_CODES, string> = {
  AUTH_REQUIRED: "authentication required: provide bearer token from /api/auth/login",
  AUTH_INVALID_CREDENTIALS: "invalid username or password",
  AUTH_TOKEN_INVALID: "bearer token is invalid or expired: {reason}",
  RBAC_DENIED: "role denied: action '{action}' requires one of {required}, but got {role}",
  VALIDATION_FAILED: "invalid payload: {reason}",
  RATE_LIMITED: "too many requests",
  PLAN_NOT_FOUND: "restoration plan #{id} does not exist",
  PLAN_NOT_SUBMITTED: "plan #{id} is not pending approval (current status: {status}); only SUBMITTED plans can be reviewed",
  PLAN_NOT_APPROVED: "plan #{id} is not approved (current status: {status}); restoration steps can only run on APPROVED plans",
  PLAN_EDIT_LOCKED: "plan #{id} in status {status} cannot be edited; only DRAFT/REJECTED plans (or owner revision of APPROVED) are editable",
  PLAN_REJECTION_REASON_REQUIRED: "rejecting plan #{id} requires a non-empty rejection reason",
  PLAN_STEPS_INCOMPLETE: "plan #{id} cannot be archived: {pending} of {total} step(s) are not COMPLETED",
  STEP_NOT_FOUND: "restoration step #{id} does not exist",
  STEP_REGISTER_LOCKED: "step registration forbidden: plan #{id} is {status}; steps can only be registered while the plan is APPROVED",
  STEP_EXECUTION_FROZEN: "step execution forbidden: plan #{id} is {status}; existing steps are preserved but paused until the plan is approved again",
  STEP_INVALID_TRANSITION: "illegal step transition: step #{id} is {from}, allowed statuses are {allowed}",
  STEP_ORDER_BLOCKED: "step #{id} is blocked: previous step #{previous} must be COMPLETED first (strict step_order execution)",
  RELIC_NOT_FOUND: "relic #{id} does not exist",
  INTERNAL_ERROR: "internal server error"
};
