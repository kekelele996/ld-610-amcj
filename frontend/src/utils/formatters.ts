import { PlanApprovalStatusText } from "../constants/PlanApprovalStatus";
import { StepExecutionStatusText } from "../constants/StepExecutionStatus";
import { ApprovalActionText } from "../constants/StepExecutionStatus";
import type { PlanProgress } from "../types/RestorationPlan";
import type { RestorationStep } from "../types/RestorationStep";

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString("zh-CN") : "—";

export const formatStatus = (value: string) => value.replace(/_/g, " ");

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

export const formatRisk = (value: string) =>
  ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

// 方案审批状态文案：多个页面与状态徽标共用
export const formatPlanStatus = (value: string) =>
  (PlanApprovalStatusText as Record<string, string>)[value] ?? value;

// 步骤执行状态文案
export const formatStepStatus = (value: string) =>
  (StepExecutionStatusText as Record<string, string>)[value] ?? value;

// 审批轨迹动作文案
export const formatApprovalAction = (value: string) =>
  (ApprovalActionText as Record<string, string>)[value] ?? value;

// 档案进度文案：已完成/总数（百分比）
export const formatProgress = (progress?: PlanProgress) =>
  progress ? `${progress.finished}/${progress.total}（${progress.percent}%）` : "0/0（0%）";

// 计算一组步骤的进度（前端兜底，正常以后端 DTO 为准）
export const summarizeSteps = (steps: RestorationStep[]): PlanProgress => {
  const total = steps.length;
  const pending = steps.filter((s) => s.step_status === "PENDING").length;
  const in_progress = steps.filter((s) => s.step_status === "IN_PROGRESS").length;
  const finished = steps.filter((s) => s.step_status === "FINISHED").length;
  const percent = total === 0 ? 0 : Math.round((finished / total) * 100);
  return { total, pending, in_progress, finished, percent, all_finished: total > 0 && finished === total };
};
