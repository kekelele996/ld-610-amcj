import { ERROR_MESSAGES } from "../constants/errorMessages";

// 统一的失败原因结构：与后端 errorHandlerMiddleware 输出对齐
export interface ApiError {
  code: string;
  message: string;
  status: number;
}

const TOKEN_KEY = "relic-restore-token";

export const getToken = (): string => localStorage.getItem(TOKEN_KEY) ?? "";
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        ...(options.headers ?? {})
      }
    });
  } catch {
    throw { code: "NETWORK_ERROR", message: ERROR_MESSAGES.NETWORK_ERROR, status: 0 } satisfies ApiError;
  }

  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // 越权或跳过审批：原样抛出后端的 code 与明确失败原因
    throw {
      code: body?.code ?? "BUSINESS_ERROR",
      message: body?.message ?? `请求失败（${res.status}）`,
      status: res.status
    } satisfies ApiError;
  }
  return body as T;
}
