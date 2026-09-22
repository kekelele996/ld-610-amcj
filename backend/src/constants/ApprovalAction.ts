import type { PlanApprovalStatus } from "./PlanApprovalStatus";

/** 方案在审批链上的可追溯动作，与 approval_record.action 一一对应 */
export const ApprovalAction = ["SUBMIT", "APPROVE", "REJECT", "RESUBMIT", "ARCHIVE"] as const;
export type ApprovalAction = (typeof ApprovalAction)[number];

export const ApprovalActionText: Record<ApprovalAction, string> = {
  SUBMIT: "提交审批",
  APPROVE: "审批通过",
  REJECT: "退回方案",
  RESUBMIT: "修改后重新送审",
  ARCHIVE: "归档"
};

/** 每个动作允许的源状态；任何跳过审批的状态跳转都会在 service 中被拒绝 */
export const ApprovalTransition: Record<ApprovalAction, { from: PlanApprovalStatus[]; to: PlanApprovalStatus }> = {
  SUBMIT: { from: ["DRAFT"], to: "SUBMITTED" },
  RESUBMIT: { from: ["APPROVED", "REJECTED"], to: "SUBMITTED" },
  APPROVE: { from: ["SUBMITTED"], to: "APPROVED" },
  REJECT: { from: ["SUBMITTED"], to: "REJECTED" },
  ARCHIVE: { from: ["APPROVED"], to: "ARCHIVED" }
};
