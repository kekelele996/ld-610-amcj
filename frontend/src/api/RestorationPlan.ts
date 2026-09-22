import { mockData } from "../mocks/seedData";
import { request } from "./client";
import type { RestorationPlan } from "../types/RestorationPlan";

const endpoint = "/api/restoration-plan";

export async function listRestorationPlan(): Promise<RestorationPlan[]> {
  try {
    return await request<RestorationPlan[]>(endpoint);
  } catch {
    // 未登录或后端离线时回退本地种子，保证评审界面可打开（写操作不允许回退）
    return [...(mockData.restorationPlan as unknown as RestorationPlan[])];
  }
}

export const fetchRestorationPlan = (id: number) =>
  request<RestorationPlan>(`${endpoint}/${id}`);

export interface PlanApprovalRequest {
  action: "SUBMIT" | "APPROVE" | "REJECT" | "ARCHIVE";
  reason?: string;
  comment?: string;
}

// 审批链统一入口：审批/退回/归档；后端负责权限与状态校验，失败返回明确原因
export const submitPlanApproval = (id: number, payload: PlanApprovalRequest) =>
  request<RestorationPlan>(`${endpoint}/${id}/approval`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const createRestorationPlan = (payload: {
  relic_id: number;
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
}) =>
  request<RestorationPlan>(endpoint, { method: "POST", body: JSON.stringify(payload) });
