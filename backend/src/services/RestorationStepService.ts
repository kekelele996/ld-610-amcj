import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { restorationPlanService } from "./RestorationPlanService";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { StepStatus } from "../constants/StepStatus";
import { BusinessError } from "../utils/BusinessError";
import { renderTemplate, toAuditTarget } from "../utils/formatters";
import { auditLogService } from "./AuditLogService";
import {
  createRestorationStepRegisterInput
} from "../constructors/RestorationStepDtoFactory";
import type { RestorationStep } from "../models/RestorationStep";
import type { AuthUser } from "../types/express";

export const restorationStepService = {
  list() {
    return restorationStepRepository.findAll();
  },

  /**
   * 修复师登记步骤：
   * 仅当方案 APPROVED 时允许。DRAFT/SUBMITTED/REJECTED/ARCHIVED 一律以
   * STEP_REGISTER_LOCKED 明确拒绝，杜绝「跳过审批先施工」。
   */
  register(user: AuthUser, body: Record<string, unknown>): RestorationStep {
    const input = createRestorationStepRegisterInput(body ?? {});
    if (!input.plan_id) {
      throw new BusinessError("VALIDATION_FAILED", { reason: "plan_id is required" });
    }
    if (!input.technique) {
      throw new BusinessError("VALIDATION_FAILED", { reason: "technique is required" });
    }
    const plan = restorationPlanService.requirePlan(input.plan_id);
    if (plan.approval_status !== "APPROVED") {
      throw new BusinessError("STEP_REGISTER_LOCKED", { id: plan.id, status: plan.approval_status }, 409);
    }
    const stepOrder = restorationStepRepository.countByPlanId(plan.id) + 1;
    const created = restorationStepRepository.insert({
      plan_id: plan.id,
      step_order: stepOrder,
      technique: input.technique,
      material_used: input.material_used,
      operator_id: null,
      step_status: "PENDING",
      registered_at: new Date().toISOString(),
      started_at: null,
      finished_at: null
    });
    auditLogService.record(
      user,
      renderTemplate(LOG_TEMPLATES.RestorationStep[4], { actor: user.display_name, id: created.id, planId: plan.id }),
      "RestorationStep",
      toAuditTarget("RestorationStep", created.id),
      created.technique
    );
    return created;
  },

  /** 开始执行：PENDING -> IN_PROGRESS；严格按 step_order，前一步未完成则阻断 */
  start(user: AuthUser, id: number): RestorationStep {
    const step = this.requireStep(id);
    const plan = restorationPlanService.requirePlan(step.plan_id);
    // 退回待审/重新送审期间：既有步骤保留，但禁止继续执行
    if (plan.approval_status !== "APPROVED") {
      throw new BusinessError("STEP_EXECUTION_FROZEN", { id: plan.id, status: plan.approval_status }, 409);
    }
    if (step.step_status !== "PENDING") {
      throw new BusinessError("STEP_INVALID_TRANSITION", {
        id,
        from: step.step_status,
        allowed: StepStatus[0]
      }, 409);
    }
    const blocker = restorationStepRepository
      .findByPlanId(plan.id)
      .find((item) => item.step_order < step.step_order && item.step_status !== "COMPLETED");
    if (blocker) {
      throw new BusinessError("STEP_ORDER_BLOCKED", { id, previous: blocker.id }, 409);
    }
    const updated = restorationStepRepository.update(id, {
      step_status: "IN_PROGRESS",
      operator_id: user.id,
      started_at: new Date().toISOString()
    })!;
    this.logTransition(user, step, updated);
    return updated;
  },

  /** 完成执行：IN_PROGRESS -> COMPLETED；只有开始该步骤的修复师可以办结 */
  complete(user: AuthUser, id: number, body: Record<string, unknown> = {}): RestorationStep {
    const step = this.requireStep(id);
    const plan = restorationPlanService.requirePlan(step.plan_id);
    if (plan.approval_status !== "APPROVED") {
      throw new BusinessError("STEP_EXECUTION_FROZEN", { id: plan.id, status: plan.approval_status }, 409);
    }
    if (step.step_status !== "IN_PROGRESS") {
      throw new BusinessError("STEP_INVALID_TRANSITION", {
        id,
        from: step.step_status,
        allowed: StepStatus[1]
      }, 409);
    }
    if (step.operator_id !== user.id) {
      throw new BusinessError("RBAC_DENIED", {
        action: "complete step",
        required: `operator#${step.operator_id}`,
        role: `user#${user.id}`
      }, 403);
    }
    const materialUsed =
      typeof body.material_used === "string" && body.material_used.trim()
        ? body.material_used.trim()
        : step.material_used;
    const updated = restorationStepRepository.update(id, {
      step_status: "COMPLETED",
      material_used: materialUsed,
      finished_at: new Date().toISOString()
    })!;
    this.logTransition(user, step, updated);
    return updated;
  },

  requireStep(id: number): RestorationStep {
    const step = restorationStepRepository.findById(id);
    if (!step) throw new BusinessError("STEP_NOT_FOUND", { id }, 404);
    return step;
  },

  logTransition(user: AuthUser, before: RestorationStep, after: RestorationStep) {
    auditLogService.record(
      user,
      renderTemplate(LOG_TEMPLATES.RestorationStep[5], {
        actor: user.display_name,
        id: after.id,
        from: before.step_status,
        to: after.step_status
      }),
      "RestorationStep",
      toAuditTarget("RestorationStep", after.id),
      after.technique
    );
  }
};
