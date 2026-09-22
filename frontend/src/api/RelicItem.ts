import { mockData } from "../mocks/seedData";
import { request } from "./client";
import type { RelicItem } from "../types/RelicItem";

const endpoint = "/api/relic-item";

export async function listRelicItem(): Promise<RelicItem[]> {
  try {
    return await request<RelicItem[]>(endpoint);
  } catch {
    // 未登录或后端离线时回退本地种子
    return [...(mockData.relicItem as unknown as RelicItem[])];
  }}

export async function saveRelicItem(payload: RelicItem) {
  console.info("save RelicItem", payload);
  return payload;
}
