import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { ApiErrorBody } from "../types/ApiError";

const TOKEN_KEY = "relic-restore-token";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY)
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly detail: string;

  constructor(body: ApiErrorBody, status: number) {
    super(body.message);
    this.name = "ApiError";
    this.code = body.code;
    this.status = status;
    this.detail = body.message;
  }

  /** 中文标题 + 后端原始失败原因，任何越权/跳过审批都能看到明确原因 */
  get displayMessage(): string {
    const headline = (ERROR_MESSAGES as Record<string, string>)[this.code] ?? "请求失败";
    return this.detail ? `${headline}（${this.detail}）` : headline;
  }
}

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined)
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({ code: "INTERNAL_ERROR", message: "invalid response" }));
  if (!res.ok) {
    if (body.code === "AUTH_REQUIRED" || body.code === "AUTH_TOKEN_INVALID") {
      tokenStorage.clear();
    }
    throw new ApiError(body as ApiErrorBody, res.status);
  }
  return body as T;
}
