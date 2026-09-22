import type { RestorationStep } from "../models/RestorationStep";

export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;

/** 渲染 constants/errorMessages 与日志模板中的 {placeholder} */
export const renderTemplate = (template: string, params: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => (params[key] === undefined ? `{${key}}` : String(params[key])));

export interface PlanProgress {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  percent: number;
  /** 方案被退回/重新送审期间，既有步骤保留但禁止继续执行 */
  executionFrozen: boolean;
}

export const buildPlanProgress = (steps: RestorationStep[], executionFrozen: boolean): PlanProgress => {
  const total = steps.length;
  const completed = steps.filter((step) => step.step_status === "COMPLETED").length;
  const inProgress = steps.filter((step) => step.step_status === "IN_PROGRESS").length;
  const pending = total - completed - inProgress;
  return {
    total,
    completed,
    inProgress,
    pending,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    executionFrozen
  };
};
