import { useCallback, useMemo, useState } from "react";
import { ApprovalFromStatus } from "../constants/ApprovalAction";
import { RoleText, type RoleName } from "../constants/Role";
import type { PlanApprovalStatus } from "../constants/PlanApprovalStatus";
import type { ApprovalActionName, RestorationPlanDetail } from "../types/RestorationPlan";

export interface PlanActionAvailability {
  canSubmit: boolean;
  canResubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canArchive: boolean;
  canRegisterStep: boolean;
  canRunSteps: boolean;
  isOwner: boolean;
  /** 方案退回待审：既有步骤保留但禁止继续执行 */
  executionFrozen: boolean;
}

const roleAllows = (role: RoleName | undefined, action: ApprovalActionName): boolean => {
  if (!role) return false;
  switch (action) {
    case "SUBMIT":
    case "RESUBMIT":
      return role === "RESTORER";
    case "APPROVE":
    case "REJECT":
      return role === "EXPERT";
    case "ARCHIVE":
      return role === "ARCHIVIST";
  }
};

/**
 * 方案审批链权限推导。前端仅控制按钮显隐/禁用，真正的越权与跳过审批拦截在后端；
 * 任何前端绕过（直接调 API）都会拿到 RBAC_DENIED / 状态错误码。
 */
export function usePlanApproval(plan: RestorationPlanDetail | null, userId?: number, role?: RoleName) {
  const [actionError, setActionError] = useState<string | null>(null);

  const availability: PlanActionAvailability = useMemo(() => {
    if (!plan) {
      return {
        canSubmit: false,
        canResubmit: false,
        canApprove: false,
        canReject: false,
        canArchive: false,
        canRegisterStep: false,
        canRunSteps: false,
        isOwner: false,
        executionFrozen: false
      };
    }
    const status: PlanApprovalStatus = plan.approval_status;
    const isOwner = userId !== undefined && plan.owner_id === userId;
    const ownerCanSubmit = isOwner && role === "RESTORER";
    const canSubmit = ownerCanSubmit && ApprovalFromStatus.SUBMIT.includes(status);
    const canResubmit = ownerCanSubmit && ApprovalFromStatus.RESUBMIT.includes(status);
    const canApprove = roleAllows(role, "APPROVE") && ApprovalFromStatus.APPROVE.includes(status);
    const canReject = roleAllows(role, "REJECT") && ApprovalFromStatus.REJECT.includes(status);
    const allStepsDone =
      plan.progress.total > 0 && plan.progress.completed === plan.progress.total;
    const canArchive = roleAllows(role, "ARCHIVE") && ApprovalFromStatus.ARCHIVE.includes(status) && allStepsDone;
    const canRegisterStep = role === "RESTORER" && status === "APPROVED";
    const canRunSteps = role === "RESTORER" && status === "APPROVED" && plan.progress.total > 0;
    return {
      canSubmit,
      canResubmit,
      canApprove,
      canReject,
      canArchive,
      canRegisterStep,
      canRunSteps,
      isOwner,
      executionFrozen: plan.progress.executionFrozen
    };
  }, [plan, userId, role]);

  const guard = useCallback(
    async (allowed: boolean, fn: () => Promise<boolean>): Promise<boolean> => {
      if (!allowed || !role) {
        const reason = `当前角色（${role ? RoleText[role] : "未登录"}）或方案状态不允许该操作，后端同样会拒绝此请求`;
        setActionError(reason);
        return false;
      }
      setActionError(null);
      const ok = await fn();
      return ok;
    },
    [role]
  );

  return { availability, actionError, setActionError, guard };
}
