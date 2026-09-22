import type { PlanApprovalStatus } from "../constants/PlanApprovalStatus";

// 方案创建/编辑请求载荷；审批状态只能经专门审批动作流转，禁止直接写入
export interface RestorationPlanPayload {
  relic_id?: number;
  damage_record_id?: number;
  plan_title?: string;
  method?: string;
  risk_assessment?: string;
  approval_status?: PlanApprovalStatus;
  owner_id?: number;
}

// 审批动作载荷：退回必须携带 reason
export interface PlanApprovalPayload {
  action?: "SUBMIT" | "APPROVE" | "REJECT" | "ARCHIVE";
  reason?: string;
  comment?: string;
}
