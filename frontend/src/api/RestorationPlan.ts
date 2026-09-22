import { http } from "./http";
import type { RestorationPlanDetail } from "../types/RestorationPlan";

const endpoint = "/api/restoration-plan";

/** 方案列表带审批链、步骤与进度（后端聚合详情 DTO） */
export async function listRestorationPlan(): Promise<RestorationPlanDetail[]> {
  return http<RestorationPlanDetail[]>(endpoint);
}

export async function getRestorationPlan(id: number): Promise<RestorationPlanDetail> {
  return http<RestorationPlanDetail>(`${endpoint}/${id}`);
}

export interface CreatePlanPayload {
  relic_id: number;
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
}

export async function createRestorationPlan(payload: CreatePlanPayload) {
  return http(`${endpoint}`, { method: "POST", body: JSON.stringify(payload) });
}

/** 修复师修订方案内容（仅 DRAFT/REJECTED 可改，后端锁定其余状态） */
export async function reviseRestorationPlan(
  id: number,
  patch: Partial<Pick<CreatePlanPayload, "plan_title" | "method" | "risk_assessment">>
) {
  return http(`${endpoint}/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export async function submitRestorationPlan(id: number, comment = "") {
  return http(`${endpoint}/${id}/submit`, { method: "POST", body: JSON.stringify({ comment }) });
}

export async function approveRestorationPlan(id: number, comment = "") {
  return http(`${endpoint}/${id}/approve`, { method: "POST", body: JSON.stringify({ comment }) });
}

/** 退回必须带 reason；缺失时后端返回 PLAN_REJECTION_REASON_REQUIRED */
export async function rejectRestorationPlan(id: number, reason: string) {
  return http(`${endpoint}/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
}

export async function archiveRestorationPlan(id: number, comment = "") {
  return http(`${endpoint}/${id}/archive`, { method: "POST", body: JSON.stringify({ comment }) });
}
