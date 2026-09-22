import { mockData } from "../mocks/seedData";
import { request } from "./client";
import type { ImageVersion } from "../types/ImageVersion";

const endpoint = "/api/image-version";

export async function listImageVersion(): Promise<ImageVersion[]> {
  try {
    return await request<ImageVersion[]>(endpoint);
  } catch {
    return [...(mockData.imageVersion as unknown as ImageVersion[])];
  }
}

export async function saveImageVersion(payload: ImageVersion) {
  console.info("save ImageVersion", payload);
  return payload;
}
