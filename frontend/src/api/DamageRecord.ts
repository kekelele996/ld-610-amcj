import { http } from "./http";
import type { DamageRecord } from "../types/DamageRecord";

const endpoint = "/api/damage-record";

export async function listDamageRecord(): Promise<DamageRecord[]> {
  return http<DamageRecord[]>(endpoint);
}

export async function saveDamageRecord(payload: Partial<DamageRecord> & { relic_id: number; damage_type: string }) {
  return http<DamageRecord>(endpoint, { method: "POST", body: JSON.stringify(payload) });
}
