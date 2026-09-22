import { mockData } from "../mocks/seedData";
import { request } from "./client";
import type { RestorationStep } from "../types/RestorationStep";

const endpoint = "/api/restoration-step";

export async function listRestorationStep(planId?: number): Promise<RestorationStep[]> {
  try {
    return await request<RestorationStep[]>(`${endpoint}${planId ? `?plan_id=${planId}` : ""}`);
  } catch {
    return [...(mockData.restorationStep as unknown as RestorationStep[])];
  }
}

// 登记步骤：方案未经专家通过时后端会返回 PLAN_APPROVAL_REQUIRED
export const registerRestorationStep = (payload: {
  plan_id: number;
  technique: string;
  material_used?: string;
}) => request<RestorationStep>(endpoint, { method: "POST", body: JSON.stringify(payload) });

// 开始执行：跳序或方案被退回时后端返回 STEP_ORDER_BLOCKED / PLAN_RETURNED_EXECUTION_BLOCKED
export const startRestorationStep = (id: number) =>
  request<RestorationStep>(`${endpoint}/${id}/start`, { method: "POST" });

export const finishRestorationStep = (id: number, quality_note?: string) =>
  request<RestorationStep>(`${endpoint}/${id}/finish`, {
    method: "POST",
    body: JSON.stringify({ quality_note })
  });
