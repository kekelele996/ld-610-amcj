import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { auditLogRepository } from "../repositories/AuditLogRepository";
import { createRestorationStepDto } from "../constructors/RestorationStepDtoFactory";
import { LOG_TEMPLATES, AUDIT_MESSAGE_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { UserRoleText } from "../constants/UserRole";
import type { RestorationStep } from "../models/RestorationStep";
import type { RestorationStepPayload } from "../types/RestorationStepPayload";
import type { AuthUser } from "../types/AuthUser";
import { BusinessError, notFoundError, validationError, conflictError } from "../utils/errors";
import { summarizePlanProgress, nextExecutableOrder } from "../utils/progress";

const STEP_LABEL = "修复步骤";

const readId = (value: unknown): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw validationError(ERROR_MESSAGES.VALIDATION_FAILED + "：id 非法");
  return id;
};

const now = () => new Date().toISOString();

// 方案执行门禁：未通过禁止任何步骤操作；退回待审冻结既有步骤；归档锁定
const assertExecutablePlan = (planId: number) => {
  const plan = restorationPlanRepository.peekById(planId);
  if (!plan) throw notFoundError("PLAN_NOT_FOUND", `修复方案不存在：id=${planId}`);
  if (plan.approval_status === "REJECTED") {
    throw conflictError(
      "PLAN_RETURNED_EXECUTION_BLOCKED",
      `${ERROR_MESSAGES.PLAN_RETURNED_EXECUTION_BLOCKED}：plan#${planId}，退回原因：${plan.rejection_reason ?? "未填写"}`
    );
  }
  if (plan.approval_status === "ARCHIVED") {
    throw conflictError("PLAN_ARCHIVED_LOCKED", `${ERROR_MESSAGES.PLAN_ARCHIVED_LOCKED}：plan#${planId}`);
  }
  if (plan.approval_status !== "APPROVED") {
    throw conflictError(
      "PLAN_APPROVAL_REQUIRED",
      `${ERROR_MESSAGES.PLAN_APPROVAL_REQUIRED}：plan#${planId} 当前状态=${plan.approval_status}`
    );
  }
  return plan;
};

const assertRestorer = (actor: AuthUser, action: string) => {
  if (actor.role !== "RESTORER") {
    throw new BusinessError(
      "RBAC_DENIED",
      `${ERROR_MESSAGES.RBAC_DENIED}：角色「${UserRoleText[actor.role]}」不允许${action}`,
      403
    );
  }
};

const writeAudit = (actor: AuthUser, action: string, step: RestorationStep, message: string) =>
  auditLogRepository.record({ actor, action, target_type: "RestorationStep", target_id: step.id, message });

export const restorationStepService = {
  list(planId?: unknown) {
    if (planId !== undefined && planId !== "") {
      return restorationStepRepository.findByPlanId(readId(planId));
    }
    return restorationStepRepository.findAll();
  },

  // 修复师登记步骤：方案必须已审批通过；退回待审/草稿/待审批一律拒绝
  create(actor: AuthUser, payload: RestorationStepPayload): RestorationStep {
    assertRestorer(actor, "登记修复步骤");
    const planId = readId(payload.plan_id);
    assertExecutablePlan(planId);
    if (!payload.technique || !String(payload.technique).trim()) {
      throw validationError(ERROR_MESSAGES.VALIDATION_FAILED + "：technique 不能为空");
    }
    const requestedOrder = payload.step_order === undefined ? undefined : Number(payload.step_order);
    if (requestedOrder !== undefined && (!Number.isInteger(requestedOrder) || requestedOrder <= 0)) {
      throw validationError(ERROR_MESSAGES.VALIDATION_FAILED + "：step_order 必须为正整数");
    }
    const timestamp = now();
    const nextOrder = restorationStepRepository.nextOrderForPlan(planId);
    const step = createRestorationStepDto({
      plan_id: planId,
      step_order: requestedOrder ?? nextOrder,
      technique: String(payload.technique).trim(),
      material_used: String(payload.material_used ?? ""),
      operator_id: actor.id,
      operator_name: actor.name,
      created_at: timestamp,
      updated_at: timestamp
    });
    const saved = restorationStepRepository.insert(step);
    writeAudit(actor, LOG_TEMPLATES.RestorationStep[0], saved, AUDIT_MESSAGE_TEMPLATES.stepCreate(planId, saved.step_order));
    return saved;
  },

  // 开始执行：只能开始当前顺序的步骤（前序必须全部 FINISHED）
  start(actor: AuthUser, id: unknown): RestorationStep {
    assertRestorer(actor, "执行修复步骤");
    const stepId = readId(id);
    const step = restorationStepRepository.findById(stepId);
    if (!step) throw notFoundError("STEP_NOT_FOUND", `${STEP_LABEL}不存在：id=${stepId}`);
    assertExecutablePlan(step.plan_id);
    if (step.step_status !== "PENDING") {
      throw conflictError("STEP_NOT_STARTABLE", `${ERROR_MESSAGES.STEP_NOT_STARTABLE}：step#${stepId} 当前状态=${step.step_status}`);
    }
    const planSteps = restorationStepRepository.findByPlanId(step.plan_id);
    const expectedOrder = nextExecutableOrder(planSteps);
    if (expectedOrder !== step.step_order) {
      throw conflictError(
        "STEP_ORDER_BLOCKED",
        `${ERROR_MESSAGES.STEP_ORDER_BLOCKED}：第${expectedOrder ?? "?"}步尚未完成，不能直接执行第${step.step_order}步`
      );
    }
    const timestamp = now();
    const updated = restorationStepRepository.update(stepId, {
      step_status: "IN_PROGRESS", started_at: timestamp, updated_at: timestamp
    });
    writeAudit(actor, LOG_TEMPLATES.RestorationStep[1], updated, AUDIT_MESSAGE_TEMPLATES.stepStart(stepId, step.plan_id));
    return updated;
  },

  // 完成步骤（质检）：执行中 -> 已完成
  finish(actor: AuthUser, id: unknown, payload: { quality_note?: string } = {}): RestorationStep {
    assertRestorer(actor, "完成修复步骤");
    const stepId = readId(id);
    const step = restorationStepRepository.findById(stepId);
    if (!step) throw notFoundError("STEP_NOT_FOUND", `${STEP_LABEL}不存在：id=${stepId}`);
    assertExecutablePlan(step.plan_id);
    if (step.step_status !== "IN_PROGRESS") {
      throw conflictError("STEP_NOT_FINISHABLE", `${ERROR_MESSAGES.STEP_NOT_FINISHABLE}：step#${stepId} 当前状态=${step.step_status}`);
    }
    const timestamp = now();
    const updated = restorationStepRepository.update(stepId, {
      step_status: "FINISHED",
      finished_at: timestamp,
      updated_at: timestamp,
      quality_note: String(payload.quality_note ?? "质检通过")
    });
    writeAudit(actor, LOG_TEMPLATES.RestorationStep[2], updated, AUDIT_MESSAGE_TEMPLATES.stepFinish(stepId, step.plan_id));
    return updated;
  },

  progress(planId: unknown) {
    return summarizePlanProgress(restorationStepRepository.findByPlanId(readId(planId)));
  }
};
