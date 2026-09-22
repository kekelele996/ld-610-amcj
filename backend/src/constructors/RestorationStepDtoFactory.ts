import type { RestorationStep } from "../models/RestorationStep";

export const createRestorationStepDto = (overrides = {}) => ({
  id: 1,
  plan_id: 1,
  step_order: 1,
  technique: "technique 1",
  material_used: "",
  operator_id: null,
  step_status: "PENDING",
  registered_at: new Date(0).toISOString(),
  started_at: null,
  finished_at: null,
  ...overrides
});

/** 登记步骤的请求 DTO：只接受工艺与材料，step_order/状态由 service 按规则生成 */
export const createRestorationStepRegisterInput = (body: Record<string, unknown>) => ({
  plan_id: Number(body.plan_id),
  technique: typeof body.technique === "string" ? body.technique.trim() : "",
  material_used: typeof body.material_used === "string" ? body.material_used.trim() : ""
});

export type RestorationStepRegisterInput = ReturnType<typeof createRestorationStepRegisterInput>;

export const toRestorationStepDto = (step: RestorationStep): RestorationStep => ({ ...step });
