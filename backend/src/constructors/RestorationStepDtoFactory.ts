import type { RestorationStep } from "../models/RestorationStep";

export const toRestorationStepDto = (step: RestorationStep): RestorationStep => ({ ...step });

export const toRestorationStepListDto = (rows: RestorationStep[]): RestorationStep[] =>
  rows.map(toRestorationStepDto);

// 登记新步骤时的默认结构：默认追加到末尾、待执行
export const createRestorationStepDto = (overrides: Partial<RestorationStep> = {}): RestorationStep => ({
  id: 0,
  plan_id: 0,
  step_order: 1,
  technique: "",
  material_used: "",
  operator_id: 0,
  operator_name: "",
  step_status: "PENDING",
  started_at: null,
  finished_at: null,
  quality_note: "",
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
  ...overrides
});
