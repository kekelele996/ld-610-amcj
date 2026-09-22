import { http } from "./http";
import type { RelicItem } from "../types/RelicItem";
import type { RelicArchive } from "../types/RelicArchive";

const endpoint = "/api/relic-item";

export async function listRelicItem(): Promise<RelicItem[]> {
  return http<RelicItem[]>(endpoint);
}

/** 文物档案：含每个方案的审批状态、退回原因与步骤进度 */
export async function listRelicArchives(): Promise<RelicArchive[]> {
  return http<RelicArchive[]>(`${endpoint}/archives`);
}

export async function getRelicArchive(id: number): Promise<RelicArchive> {
  return http<RelicArchive>(`${endpoint}/${id}/archive`);
}
