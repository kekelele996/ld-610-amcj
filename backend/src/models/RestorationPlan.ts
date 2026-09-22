import type { PlanApprovalStatus } from "../constants/PlanApprovalStatus";
import type { ApprovalAction } from "../constants/StepExecutionStatus";
import type { UserRole } from "../constants/UserRole";

// 审批轨迹上的一个节点（送审 / 通过 / 退回 / 归档）
export interface ApprovalRecord {
  id: number;
  plan_id: number;
  action: ApprovalAction;
  actor_id: number;
  actor_name: string;
  actor_role: UserRole;
  comment: string;
  created_at: string;
}

export interface RestorationPlan {
  id: number;
  relic_id: number;
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  approval_status: PlanApprovalStatus;
  owner_id: number;
  owner_name: string;
  submitted_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  archived_at: string | null;
  // 最近一次退回原因：方案退回待审时写入，重新通过后清空为 null
  rejection_reason: string | null;
  updated_at: string;
  approval_records: ApprovalRecord[];
}
