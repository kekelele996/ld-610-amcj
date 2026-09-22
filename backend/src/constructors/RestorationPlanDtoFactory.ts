import type { PlanProgress } from "../utils/formatters";
import type { ApprovalRecord, RestorationPlan } from "../models/RestorationPlan";
import type { RestorationStep } from "../models/RestorationStep";

export interface RestorationPlanDetailDto extends RestorationPlan {
  owner_name: string | null;
  steps: RestorationStep[];
  approval_records: ApprovalRecord[];
  progress: PlanProgress;
}

export const createRestorationPlanDto = (overrides = {}) => ({
  id: 1,
  relic_id: 1,
  damage_record_id: 1,
  plan_title: "plan title 1",
  method: "method 1",
  risk_assessment: "risk assessment 1",
  approval_status: "DRAFT",
  owner_id: 1,
  approval_version: 1,
  reject_reason: null,
  submitted_at: null,
  approved_at: null,
  archived_at: null,
  ...overrides
});

/** 方案详情响应：审批链 + 步骤 + 进度，供前端 PlansPage 与档案页共同消费 */
export const createRestorationPlanDetailDto = (
  plan: RestorationPlan,
  extras: Omit<RestorationPlanDetailDto, keyof RestorationPlan>
): RestorationPlanDetailDto => ({
  ...plan,
  ...extras
});
