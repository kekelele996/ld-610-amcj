import type { RestorationPlan, ApprovalRecord } from "../models/RestorationPlan";
import type { PlanProgress } from "../models/RestorationStep";
import { summarizePlanProgress } from "../utils/progress";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";

// 响应 DTO：附带修复进度，供档案页与方案列表展示
export interface RestorationPlanResponseDto extends RestorationPlan {
  progress: PlanProgress;
}

export const toRestorationPlanDto = (plan: RestorationPlan): RestorationPlanResponseDto => ({
  ...plan,
  approval_records: plan.approval_records.map((record: ApprovalRecord) => ({ ...record })),
  progress: summarizePlanProgress(restorationStepRepository.findByPlanId(plan.id))
});

export const toRestorationPlanListDto = (rows: RestorationPlan[]): RestorationPlanResponseDto[] =>
  rows.map(toRestorationPlanDto);

// 表单默认值
export const createRestorationPlanDto = (overrides: Partial<RestorationPlan> = {}): RestorationPlan => ({
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
  updated_at: new Date(0).toISOString(),
  approval_records: [],
  ...overrides
});
