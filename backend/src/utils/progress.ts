import { StepExecutionStatus } from "../constants/StepExecutionStatus";
import type { RestorationStep, PlanProgress } from "../models/RestorationStep";

// 由步骤集合汇总档案进度：档案页/方案详情/工作台共用
export const summarizePlanProgress = (steps: RestorationStep[]): PlanProgress => {
  const total = steps.length;
  const pending = steps.filter((s) => s.step_status === StepExecutionStatus[0]).length;
  const in_progress = steps.filter((s) => s.step_status === "IN_PROGRESS").length;
  const finished = steps.filter((s) => s.step_status === "FINISHED").length;
  const percent = total === 0 ? 0 : Math.round((finished / total) * 100);
  return { total, pending, in_progress, finished, percent, all_finished: total > 0 && finished === total };
};

// 找出当前允许执行的步骤序号（第一个非 FINISHED 步骤）
export const nextExecutableOrder = (steps: RestorationStep[]): number | null => {
  const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);
  const next = sorted.find((s) => s.step_status !== "FINISHED");
  return next ? next.step_order : null;
};
