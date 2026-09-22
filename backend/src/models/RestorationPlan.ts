import type { ApprovalAction } from "../constants/ApprovalAction";
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
  /** 当前生效审批版本：重新送审递增，审批链据此追溯 */
  approval_version: number;
  /** 最近一次退回原因（通过/重新送审后置 null，但历史记录保留在 ApprovalRecord） */
  reject_reason: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  archived_at: string | null;
}

export interface ApprovalRecord {
  id: number;
  plan_id: number;
  approval_version: number;
  action: ApprovalAction;
  from_status: PlanApprovalStatus | null;
  to_status: PlanApprovalStatus;
  actor_id: number;
  actor_name: string;
  comment: string;
  created_at: string;
}
