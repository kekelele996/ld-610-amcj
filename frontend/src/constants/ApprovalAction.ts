import type { PlanApprovalStatus } from "./PlanApprovalStatus";

export const ApprovalAction = ["SUBMIT", "APPROVE", "REJECT", "RESUBMIT", "ARCHIVE"] as const;
export type ApprovalActionName = (typeof ApprovalAction)[number];

export const ApprovalActionText: Record<ApprovalActionName, string> = {
  SUBMIT: "提交审批",
  APPROVE: "审批通过",
  REJECT: "退回方案",
  RESUBMIT: "修改后重新送审",
  ARCHIVE: "归档"
};

/** 与后端 ApprovalTransition 保持一致，用于按钮可用态预判（真正拦截在后端） */
export const ApprovalFromStatus: Record<ApprovalActionName, PlanApprovalStatus[]> = {
  SUBMIT: ["DRAFT"],
  RESUBMIT: ["REJECTED", "APPROVED"],
  APPROVE: ["SUBMITTED"],
  REJECT: ["SUBMITTED"],
  ARCHIVE: ["APPROVED"]
};
