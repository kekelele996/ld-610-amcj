import { useCallback, useMemo, useState } from "react";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { UserRole } from "../constants/UserRole";
import type { PlanApprovalRequest } from "../api/RestorationPlan";
import type { ApiError } from "../api/client";

interface UsePlanApprovalOptions {
  role?: UserRole;
  onApproved?: (plan: RestorationPlan) => void;
  onRejected?: (plan: RestorationPlan, reason: string) => void;
}

interface ApprovalFailure {
  code: string;
  message: string;
}

// 方案审批链：集中控制“谁在什么状态下能做什么”，任何越权/跳过审批的失败都回传明确原因
export function usePlanApproval(
  plan: RestorationPlan | null,
  runAction: (id: number, payload: PlanApprovalRequest) => Promise<RestorationPlan>,
  options: UsePlanApprovalOptions = {}
) {
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<ApprovalFailure | null>(null);

  const role = options.role;
  const status = plan?.approval_status;

  // 动作可见性（按钮显隐）；最终以后端校验为准，前端禁用不代表可以跳过
  const canSubmit = role === "RESTORER" && (status === "DRAFT" || status === "REJECTED");
  const canApprove = role === "EXPERT" && status === "SUBMITTED";
  const canReject = role === "EXPERT" && status === "SUBMITTED";
  const canArchive = role === "ARCHIVIST" && status === "APPROVED" && Boolean(plan?.progress?.all_finished);

  const clearFailure = useCallback(() => setFailure(null), []);

  const act = useCallback(
    async (payload: PlanApprovalRequest) => {
      if (!plan) {
        const error: ApiError = { code: "PLAN_NOT_FOUND", message: "修复方案不存在", status: 404 };
        setFailure(error);
        throw error;
      }
      setSubmitting(true);
      setFailure(null);
      try {
        const updated = await runAction(plan.id, payload);
        if (payload.action === "APPROVE") options.onApproved?.(updated);
        if (payload.action === "REJECT") options.onRejected?.(updated, payload.reason ?? "");
        return updated;
      } catch (error) {
        const apiError = error as ApiError;
        // 越权 / 状态非法 / 缺少退回原因等明确失败原因直接暴露给页面
        setFailure({ code: apiError.code, message: apiError.message });
        throw apiError;
      } finally {
        setSubmitting(false);
      }
    },
    [plan, runAction, options]
  );

  const submit = useCallback((comment?: string) => act({ action: "SUBMIT", comment }), [act]);
  const approve = useCallback((comment?: string) => act({ action: "APPROVE", comment }), [act]);
  const reject = useCallback((reason: string) => act({ action: "REJECT", reason }), [act]);
  const archive = useCallback((comment?: string) => act({ action: "ARCHIVE", comment }), [act]);

  return useMemo(
    () => ({
      submitting,
      failure,
      clearFailure,
      canSubmit,
      canApprove,
      canReject,
      canArchive,
      submit,
      approve,
      reject,
      archive
    }),
    [submitting, failure, clearFailure, canSubmit, canApprove, canReject, canArchive, submit, approve, reject, archive]
  );
}
