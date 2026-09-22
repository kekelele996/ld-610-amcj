import type { RestorationStep } from "../types/RestorationStep";

/** 新登记步骤默认 PENDING；step_order 由后端按方案内顺序自动分配 */
export const createDefaultRestorationStep = (overrides: Partial<RestorationStep> = {}): RestorationStep => ({
  id: 0,
  plan_id: 0,
  step_order: 0,
  technique: "",
  material_used: "",
  operator_id: null,
  step_status: "PENDING",
  registered_at: new Date(0).toISOString(),
  started_at: null,
  finished_at: null,
  ...overrides
});

export const createRestorationStepForm = createDefaultRestorationStep;
export const createRestorationStepResponse = createDefaultRestorationStep;
