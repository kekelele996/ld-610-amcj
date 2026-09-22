export const StepStatus = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;
export type StepStatusValue = (typeof StepStatus)[number];

export const StepStatusText: Record<StepStatusValue, string> = {
  PENDING: "待执行",
  IN_PROGRESS: "执行中",
  COMPLETED: "已完成"
};
