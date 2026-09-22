import type { RestorationPlan } from "../types/RestorationPlan";

/** 新方案默认从 DRAFT 起步，必须经专家 SUBMITTED -> APPROVED 后才能登记步骤 */
export const createDefaultRestorationPlan = (overrides: Partial<RestorationPlan> = {}): RestorationPlan => ({
  id: 0,
  relic_id: 0,
  damage_record_id: 0,
  plan_title: "",
  method: "",
  risk_assessment: "",
  approval_status: "DRAFT",
  owner_id: 0,
  approval_version: 1,
  reject_reason: null,
  submitted_at: null,
  approved_at: null,
  archived_at: null,
  ...overrides
});

export const createRestorationPlanForm = createDefaultRestorationPlan;
export const createRestorationPlanResponse = createDefaultRestorationPlan;
