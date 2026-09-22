import {
  approvalRecordRepository,
  restorationPlanRepository
} from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { relicItemRepository } from "../repositories/RelicItemRepository";
import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { userRepository } from "../repositories/UserRepository";
import {
  ApprovalTransition,
  type ApprovalAction as ApprovalActionType
} from "../constants/ApprovalAction";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { BusinessError } from "../utils/BusinessError";
import { buildPlanProgress, renderTemplate, toAuditTarget } from "../utils/formatters";
import { auditLogService } from "./AuditLogService";
import { createRestorationPlanDetailDto, type RestorationPlanDetailDto } from "../constructors/RestorationPlanDtoFactory";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { AuthUser } from "../types/express";

const PLANS_LOCKED_FROM_STEP_RUN = new Set(["DRAFT", "SUBMITTED", "REJECTED", "ARCHIVED"]);

export const restorationPlanService = {
  list() {
    return restorationPlanRepository.findAll();
  },

  listDetails(): RestorationPlanDetailDto[] {
    return this.list().map((plan) => this.buildDetail(plan));
  },

  getDetail(id: number): RestorationPlanDetailDto {
    const plan = restorationPlanRepository.findById(id);
    if (!plan) throw new BusinessError("PLAN_NOT_FOUND", { id }, 404);
    return this.buildDetail(plan);
  },

  /** 详情 DTO：审批记录 + 保留的既有步骤 + 实时进度（退回时 executionFrozen=true） */
  buildDetail(plan: RestorationPlan): RestorationPlanDetailDto {
    const steps = restorationStepRepository.findByPlanId(plan.id);
    const approval_records = approvalRecordRepository
      .findByPlanId(plan.id)
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    const owner = userRepository.findById(plan.owner_id);
    const frozen = PLANS_LOCKED_FROM_STEP_RUN.has(plan.approval_status);
    return createRestorationPlanDetailDto(plan, {
      owner_name: owner?.display_name ?? null,
      steps,
      approval_records,
      progress: buildPlanProgress(steps, frozen)
    });
  },

  create(user: AuthUser, body: Record<string, unknown>) {
    const relicId = Number(body.relic_id);
    const damageId = Number(body.damage_record_id);
    const planTitle = typeof body.plan_title === "string" ? body.plan_title.trim() : "";
    const method = typeof body.method === "string" ? body.method.trim() : "";
    const risk = typeof body.risk_assessment === "string" ? body.risk_assessment.trim() : "";
    if (!relicId || !damageId || !planTitle || !method || !risk) {
      throw new BusinessError("VALIDATION_FAILED", {
        reason: "relic_id, damage_record_id, plan_title, method and risk_assessment are required"
      });
    }
    if (!relicItemRepository.findById(relicId)) {
      throw new BusinessError("VALIDATION_FAILED", { reason: `relic ${relicId} does not exist` });
    }
    const damage = damageRecordRepository.findById(damageId);
    if (!damage || damage.relic_id !== relicId) {
      throw new BusinessError("VALIDATION_FAILED", {
        reason: `damage record ${damageId} does not belong to relic ${relicId}`
      });
    }
    const created = restorationPlanRepository.insert({
      relic_id: relicId,
      damage_record_id: damageId,
      plan_title: planTitle,
      method,
      risk_assessment: risk,
      approval_status: "DRAFT",
      owner_id: user.id,
      approval_version: 1,
      reject_reason: null,
      submitted_at: null,
      approved_at: null,
      archived_at: null
    });
    auditLogService.record(
      user,
      LOG_TEMPLATES.RestorationPlan[0],
      "RestorationPlan",
      toAuditTarget("RestorationPlan", created.id),
      created.plan_title
    );
    return created;
  },

  /** 编制内容：仅 DRAFT/REJECTED 可改，送审中/已归档锁定 */
  reviseContent(user: AuthUser, id: number, body: Record<string, unknown>) {
    const plan = this.requirePlan(id);
    if (plan.owner_id !== user.id) {
      throw new BusinessError("RBAC_DENIED", {
        action: "revise plan content",
        required: `owner#${plan.owner_id}`,
        role: `user#${user.id}`
      }, 403);
    }
    if (plan.approval_status !== "DRAFT" && plan.approval_status !== "REJECTED") {
      throw new BusinessError("PLAN_EDIT_LOCKED", { id, status: plan.approval_status }, 409);
    }
    const patch: Partial<RestorationPlan> = {};
    for (const key of ["plan_title", "method", "risk_assessment"] as const) {
      if (typeof body[key] === "string" && body[key].trim()) patch[key] = body[key].trim();
    }
    if (Object.keys(patch).length === 0) {
      throw new BusinessError("VALIDATION_FAILED", { reason: "no editable field provided" });
    }
    const updated = restorationPlanRepository.update(id, patch);
    auditLogService.record(user, LOG_TEMPLATES.RestorationPlan[1], "RestorationPlan", toAuditTarget("RestorationPlan", id), Object.keys(patch).join(","));
    return updated;
  },

  /** 送审：DRAFT 首次提交；REJECTED 补充修改后重新送审（审批版本递增） */
  submit(user: AuthUser, id: number, comment = "") {
    const plan = this.requirePlan(id);
    if (plan.owner_id !== user.id) {
      throw new BusinessError("RBAC_DENIED", {
        action: "submit plan",
        required: `owner#${plan.owner_id}`,
        role: `user#${user.id}`
      }, 403);
    }
    return this.applyTransition(plan, plan.approval_status === "REJECTED" ? "RESUBMIT" : "SUBMIT", user, comment);
  },

  /** 专家审批通过：SUBMITTED -> APPROVED，之后修复师才能登记/继续执行步骤（审计由状态机统一留痕） */
  approve(user: AuthUser, id: number, comment = "") {
    const plan = this.requirePlan(id);
    return this.applyTransition(plan, "APPROVE", user, comment);
  },

  /** 专家退回：必须填写退回原因；既有步骤保留，步骤执行立即冻结 */
  reject(user: AuthUser, id: number, reason: string) {
    const plan = this.requirePlan(id);
    if (typeof reason !== "string" || !reason.trim()) {
      throw new BusinessError("PLAN_REJECTION_REASON_REQUIRED", { id });
    }
    const updated = this.applyTransition(plan, "REJECT", user, reason.trim());
    restorationPlanRepository.update(id, { reject_reason: reason.trim() });
    return this.requirePlan(id);
  },

  /** 档案员归档：只有全部步骤 COMPLETED 的 APPROVED 方案可以归档 */
  archive(user: AuthUser, id: number, comment = "") {
    const plan = this.requirePlan(id);
    if (plan.approval_status !== "APPROVED") {
      throw new BusinessError("PLAN_NOT_APPROVED", { id, status: plan.approval_status }, 409);
    }
    const steps = restorationStepRepository.findByPlanId(id);
    const unfinished = steps.filter((step) => step.step_status !== "COMPLETED").length;
    if (steps.length === 0 || unfinished > 0) {
      throw new BusinessError("PLAN_STEPS_INCOMPLETE", { id, pending: unfinished, total: steps.length }, 409);
    }
    const updated = this.applyTransition(plan, "ARCHIVE", user, comment);
    return restorationPlanRepository.update(id, { archived_at: updated.archived_at ?? new Date().toISOString() });
  },

  /**
   * 审批状态机：所有状态变化的唯一入口。
   * 任何跳过审批的跳转（如 DRAFT 直接 APPROVE）都以 PLAN_NOT_SUBMITTED 等明确原因失败。
   */
  applyTransition(
    plan: RestorationPlan,
    action: ApprovalActionType,
    user: AuthUser,
    comment: string
  ): RestorationPlan {
    const rule = ApprovalTransition[action];
    if (!rule.from.includes(plan.approval_status)) {
      if (action === "APPROVE" || action === "REJECT") {
        throw new BusinessError("PLAN_NOT_SUBMITTED", { id: plan.id, status: plan.approval_status }, 409);
      }
      throw new BusinessError("PLAN_EDIT_LOCKED", { id: plan.id, status: plan.approval_status }, 409);
    }

    const now = new Date().toISOString();
    const nextVersion = action === "RESUBMIT" ? plan.approval_version + 1 : plan.approval_version;
    const updated =
      restorationPlanRepository.update(plan.id, {
        approval_status: rule.to,
        approval_version: nextVersion,
        reject_reason: action === "REJECT" ? plan.reject_reason : null,
        submitted_at: action === "SUBMIT" || action === "RESUBMIT" ? now : plan.submitted_at,
        approved_at: action === "APPROVE" ? now : plan.approved_at,
        archived_at: action === "ARCHIVE" ? now : plan.archived_at
      }) ?? plan;

    approvalRecordRepository.insert({
      plan_id: plan.id,
      approval_version: nextVersion,
      action,
      from_status: plan.approval_status,
      to_status: rule.to,
      actor_id: user.id,
      actor_name: user.display_name,
      comment,
      created_at: now
    });

    const templateIndex: Record<ApprovalActionType, number | null> = {
      SUBMIT: 4,
      RESUBMIT: 4,
      APPROVE: 5,
      REJECT: 6,
      ARCHIVE: 7
    };
    const templatePos = templateIndex[action];
    if (templatePos !== null) {
      auditLogService.record(
        user,
        renderTemplate(LOG_TEMPLATES.RestorationPlan[templatePos], {
          actor: user.display_name,
          id: plan.id,
          version: nextVersion,
          reason: comment
        }),
        "RestorationPlan",
        toAuditTarget("RestorationPlan", plan.id),
        comment
      );
    }
    return updated;
  },

  requirePlan(id: number): RestorationPlan {
    const plan = restorationPlanRepository.findById(id);
    if (!plan) throw new BusinessError("PLAN_NOT_FOUND", { id }, 404);
    return plan;
  }
};
