export const StepStatus = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;
export type StepStatus = (typeof StepStatus)[number];

export const StepStatusText: Record<StepStatus, string> = {
  PENDING: "待执行",
  IN_PROGRESS: "执行中",
  COMPLETED: "已完成"
};
