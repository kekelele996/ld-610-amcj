export const StepExecutionStatus = ["PENDING", "IN_PROGRESS", "FINISHED"] as const;
export type StepExecutionStatus = (typeof StepExecutionStatus)[number];

export const StepExecutionStatusText: Record<StepExecutionStatus, string> = {
  PENDING: "待执行",
  IN_PROGRESS: "执行中",
  FINISHED: "已完成"
};

export const ApprovalAction = ["SUBMIT", "APPROVE", "REJECT", "ARCHIVE"] as const;
export type ApprovalAction = (typeof ApprovalAction)[number];

export const ApprovalActionText: Record<ApprovalAction, string> = {
  SUBMIT: "方案送审",
  APPROVE: "审批通过",
  REJECT: "退回待审",
  ARCHIVE: "归档"
};
