// 修复步骤登记载荷：只有审批通过的方案才允许登记
export interface RestorationStepPayload {
  plan_id?: number;
  step_order?: number;
  technique?: string;
  material_used?: string;
}

// 步骤完成（质检）载荷
export interface StepFinishPayload {
  quality_note?: string;
}
