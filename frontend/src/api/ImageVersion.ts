import { http } from "./http";
import type { ImageVersion } from "../types/ImageVersion";

const endpoint = "/api/image-version";

export async function listImageVersion(): Promise<ImageVersion[]> {
  return http<ImageVersion[]>(endpoint);
}

export async function saveImageVersion(payload: Partial<ImageVersion> & { relic_id: number; file_path: string }) {
  return http<ImageVersion>(endpoint, { method: "POST", body: JSON.stringify(payload) });
}
