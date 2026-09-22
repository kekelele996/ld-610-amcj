import { http } from "./http";
import type { RestorationStep } from "../types/RestorationStep";

const endpoint = "/api/restoration-step";

export async function listRestorationStep(): Promise<RestorationStep[]> {
  return http<RestorationStep[]>(endpoint);
}

/** 登记步骤：方案未 APPROVED 时后端返回 STEP_REGISTER_LOCKED */
export async function registerRestorationStep(payload: {
  plan_id: number;
  technique: string;
  material_used?: string;
}): Promise<RestorationStep> {
  return http<RestorationStep>(endpoint, { method: "POST", body: JSON.stringify(payload) });
}

export async function startRestorationStep(id: number): Promise<RestorationStep> {
  return http<RestorationStep>(`${endpoint}/${id}/start`, { method: "POST" });
}

export async function completeRestorationStep(
  id: number,
  material_used?: string
): Promise<RestorationStep> {
  return http<RestorationStep>(`${endpoint}/${id}/complete`, {
    method: "POST",
    body: JSON.stringify({ material_used })
  });
}
