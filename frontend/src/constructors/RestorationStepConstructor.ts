import type { RestorationStep } from "../types/RestorationStep";

export const createDefaultRestorationStep = (overrides: Partial<RestorationStep> = {}): RestorationStep => ({
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
  created_at: "",
  updated_at: "",
  ...overrides
});

export const createRestorationStepForm = createDefaultRestorationStep;
export const createRestorationStepResponse = createDefaultRestorationStep;
