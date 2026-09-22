import type { RestorationPlan } from "../types/RestorationPlan";

export const createDefaultRestorationPlan = (overrides: Partial<RestorationPlan> = {}): RestorationPlan => ({
  id: 0,
  relic_id: 1,
  damage_record_id: 1,
  plan_title: "",
  method: "",
  risk_assessment: "",
  approval_status: "DRAFT",
  owner_id: 0,
  owner_name: "",
  submitted_at: null,
  approved_at: null,
  rejected_at: null,
  archived_at: null,
  rejection_reason: null,
  updated_at: "",
  approval_records: [],
  ...overrides
});

export const createRestorationPlanForm = createDefaultRestorationPlan;
export const createRestorationPlanResponse = createDefaultRestorationPlan;
