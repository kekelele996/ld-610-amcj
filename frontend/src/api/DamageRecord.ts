import { mockData } from "../mocks/seedData";
import { request } from "./client";
import type { DamageRecord } from "../types/DamageRecord";

const endpoint = "/api/damage-record";

export async function listDamageRecord(): Promise<DamageRecord[]> {
  try {
    return await request<DamageRecord[]>(endpoint);
  } catch {
    return [...(mockData.damageRecord as unknown as DamageRecord[])];
  }
}

export async function saveDamageRecord(payload: DamageRecord) {
  console.info("save DamageRecord", payload);
  return payload;
}
