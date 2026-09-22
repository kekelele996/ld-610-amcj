import type { PlanApprovalStatus } from "../constants/PlanApprovalStatus";

export interface RestorationPlan {
  id: number;
  relic_id: number;
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  approval_status: PlanApprovalStatus;
  owner_id: number;
  approval_version: number;
  reject_reason: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  archived_at: string | null;
}

export type ApprovalActionName = "SUBMIT" | "APPROVE" | "REJECT" | "RESUBMIT" | "ARCHIVE";

export interface ApprovalRecord {
  id: number;
  plan_id: number;
  approval_version: number;
  action: ApprovalActionName;
  from_status: PlanApprovalStatus | null;
  to_status: PlanApprovalStatus;
  actor_id: number;
  actor_name: string;
  comment: string;
  created_at: string;
}

export interface PlanProgress {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  percent: number;
  executionFrozen: boolean;
}

export interface RestorationPlanDetail extends RestorationPlan {
  owner_name: string | null;
  steps: import("./RestorationStep").RestorationStep[];
  approval_records: ApprovalRecord[];
  progress: PlanProgress;
}
