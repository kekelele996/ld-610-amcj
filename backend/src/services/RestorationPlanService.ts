import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { auditLogRepository } from "../repositories/AuditLogRepository";
import { toRestorationPlanDto, toRestorationPlanListDto, createRestorationPlanDto } from "../constructors/RestorationPlanDtoFactory";
import { LOG_TEMPLATES, AUDIT_MESSAGE_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { UserRoleText } from "../constants/UserRole";
import type { ApprovalAction } from "../constants/StepExecutionStatus";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { RestorationPlanPayload, PlanApprovalPayload } from "../types/RestorationPlanPayload";
import type { AuthUser } from "../types/AuthUser";
import { BusinessError, notFoundError, validationError, conflictError } from "../utils/errors";

const PLAN_LABEL = "修复方案";

const requirePlan = (id: number): RestorationPlan => {
  const plan = restorationPlanRepository.peekById(id);
  if (!plan) throw notFoundError("PLAN_NOT_FOUND", `${PLAN_LABEL}不存在：id=${id}`);
  return plan;
};

const readId = (value: unknown): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw validationError(ERROR_MESSAGES.VALIDATION_FAILED + "：id 非法");
  return id;
};

const now = () => new Date().toISOString();

const writeAudit = (
  actor: AuthUser,
  action: string,
  plan: RestorationPlan,
  message: string
) => auditLogRepository.record({ actor, action, target_type: "RestorationPlan", target_id: plan.id, message });

export const restorationPlanService = {
  list() {
    return toRestorationPlanListDto(restorationPlanRepository.findAll());
  },

  detail(id: unknown) {
    const planId = readId(id);
    const plan = restorationPlanRepository.findById(planId);
    if (!plan) throw notFoundError("PLAN_NOT_FOUND", `${PLAN_LABEL}不存在：id=${planId}`);
    return toRestorationPlanDto(plan);
  },

  // 方案编制：仅修复师；新建方案一律 DRAFT，禁止借创建接口跳过审批
  create(actor: AuthUser, payload: RestorationPlanPayload) {
    if (actor.role !== "RESTORER") {
      throw new BusinessError(
        "RBAC_DENIED",
        `${ERROR_MESSAGES.RBAC_DENIED}：角色「${UserRoleText[actor.role]}」不允许编制修复方案`,
        403
      );
    }
    if (!payload.plan_title || !String(payload.plan_title).trim()) {
      throw validationError(ERROR_MESSAGES.VALIDATION_FAILED + "：plan_title 不能为空");
    }
    const timestamp = now();
    const created: RestorationPlan = createRestorationPlanDto({
      relic_id: Number(payload.relic_id ?? 1),
      damage_record_id: Number(payload.damage_record_id ?? 1),
      plan_title: String(payload.plan_title).trim(),
      method: String(payload.method ?? ""),
      risk_assessment: String(payload.risk_assessment ?? ""),
      approval_status: "DRAFT",
      owner_id: actor.id,
      owner_name: actor.name,
      updated_at: timestamp
    });
    const saved = restorationPlanRepository.save({ ...created, id: Date.now() });
    writeAudit(actor, LOG_TEMPLATES.RestorationPlan[0], saved, AUDIT_MESSAGE_TEMPLATES.planCreate(saved.plan_title));
    return toRestorationPlanDto(saved);
  },

  // 审批链动作：SUBMIT / APPROVE / REJECT / ARCHIVE，权限与状态在此集中校验
  approve(actor: AuthUser, id: unknown, payload: PlanApprovalPayload) {
    const planId = readId(id);
    const plan = requirePlan(planId);
    const action: ApprovalAction | undefined = payload.action;
    const roleText = UserRoleText[actor.role];

    if (action === "SUBMIT") {
      if (actor.role !== "RESTORER") {
        throw new BusinessError("RBAC_DENIED", `${ERROR_MESSAGES.RBAC_DENIED}：角色「${roleText}」不允许送审方案`, 403);
      }
      if (plan.approval_status !== "DRAFT" && plan.approval_status !== "REJECTED") {
        throw conflictError("PLAN_NOT_SUBMITTABLE", `${ERROR_MESSAGES.PLAN_NOT_SUBMITTABLE}：当前状态=${plan.approval_status}`);
      }
      const timestamp = now();
      restorationPlanRepository.updateStatus(planId, {
        approval_status: "SUBMITTED",
        rejection_reason: null,
        submitted_at: timestamp,
        rejected_at: null,
        updated_at: timestamp
      });
      restorationPlanRepository.appendApprovalRecord(plan, {
        plan_id: planId, action, actor_id: actor.id, actor_name: actor.name, actor_role: actor.role,
        comment: String(payload.comment ?? "方案重新送审"), created_at: timestamp
      });
      writeAudit(actor, LOG_TEMPLATES.RestorationPlan[2], plan, AUDIT_MESSAGE_TEMPLATES.planSubmit(planId));
      return this.detail(planId);
    }

    if (action === "APPROVE") {
      // 只有专家可以通过；修复师/档案员/访客一律拒绝
      if (actor.role !== "EXPERT") {
        throw new BusinessError("RBAC_DENIED", `${ERROR_MESSAGES.RBAC_DENIED}：角色「${roleText}」不允许审批方案，审批仅专家可执行`, 403);
      }
      if (plan.approval_status !== "SUBMITTED") {
        throw conflictError("PLAN_NOT_APPROVABLE", `${ERROR_MESSAGES.PLAN_NOT_APPROVABLE}：当前状态=${plan.approval_status}`);
      }
      const timestamp = now();
      restorationPlanRepository.updateStatus(planId, {
        approval_status: "APPROVED",
        rejection_reason: null,
        approved_at: timestamp,
        rejected_at: null,
        updated_at: timestamp
      });
      restorationPlanRepository.appendApprovalRecord(plan, {
        plan_id: planId, action, actor_id: actor.id, actor_name: actor.name, actor_role: actor.role,
        comment: String(payload.comment ?? "同意实施"), created_at: timestamp
      });
      writeAudit(actor, LOG_TEMPLATES.RestorationPlan[3], plan, AUDIT_MESSAGE_TEMPLATES.planApprove(planId, actor.name));
      return this.detail(planId);
    }

    if (action === "REJECT") {
      if (actor.role !== "EXPERT") {
        throw new BusinessError("RBAC_DENIED", `${ERROR_MESSAGES.RBAC_DENIED}：角色「${roleText}」不允许退回方案，审批仅专家可执行`, 403);
      }
      if (plan.approval_status !== "SUBMITTED") {
        throw conflictError("PLAN_NOT_REJECTABLE", `${ERROR_MESSAGES.PLAN_NOT_REJECTABLE}：当前状态=${plan.approval_status}`);
      }
      const reason = String(payload.reason ?? "").trim();
      if (!reason) {
        throw validationError(ERROR_MESSAGES.REJECTION_REASON_REQUIRED);
      }
      const timestamp = now();
      // 退回待审：既有步骤保留，仅方案状态翻转，步骤执行由 service 层拦截
      restorationPlanRepository.updateStatus(planId, {
        approval_status: "REJECTED",
        rejection_reason: reason,
        rejected_at: timestamp,
        updated_at: timestamp
      });
      restorationPlanRepository.appendApprovalRecord(plan, {
        plan_id: planId, action, actor_id: actor.id, actor_name: actor.name, actor_role: actor.role,
        comment: reason, created_at: timestamp
      });
      writeAudit(actor, LOG_TEMPLATES.RestorationPlan[4], plan, AUDIT_MESSAGE_TEMPLATES.planReject(planId, actor.name, reason));
      return this.detail(planId);
    }

    if (action === "ARCHIVE") {
      if (actor.role !== "ARCHIVIST") {
        throw new BusinessError("RBAC_DENIED", `${ERROR_MESSAGES.RBAC_DENIED}：角色「${roleText}」不允许归档方案，归档仅档案员可执行`, 403);
      }
      if (plan.approval_status !== "APPROVED") {
        throw conflictError("PLAN_NOT_ARCHIVABLE", `${ERROR_MESSAGES.PLAN_NOT_ARCHIVABLE}：当前状态=${plan.approval_status}`);
      }
      const steps = restorationStepRepository.findByPlanId(planId);
      const finished = steps.filter((step) => step.step_status === "FINISHED").length;
      if (steps.length === 0 || finished !== steps.length) {
        throw conflictError("PLAN_NOT_ARCHIVABLE", `${ERROR_MESSAGES.PLAN_NOT_ARCHIVABLE}：步骤进度 ${finished}/${steps.length}，需全部完成`);
      }
      const timestamp = now();
      restorationPlanRepository.updateStatus(planId, {
        approval_status: "ARCHIVED", archived_at: timestamp, updated_at: timestamp
      });
      restorationPlanRepository.appendApprovalRecord(plan, {
        plan_id: planId, action, actor_id: actor.id, actor_name: actor.name, actor_role: actor.role,
        comment: String(payload.comment ?? "修复完成，归档入库"), created_at: timestamp
      });
      writeAudit(actor, LOG_TEMPLATES.RestorationPlan[5], plan, AUDIT_MESSAGE_TEMPLATES.planArchive(planId, actor.name));
      return this.detail(planId);
    }

    throw validationError(ERROR_MESSAGES.VALIDATION_FAILED + `：未知审批动作 ${String(action)}`);
  }
};
