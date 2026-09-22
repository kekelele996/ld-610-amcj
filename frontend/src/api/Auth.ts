import { http } from "./http";
import type { LoginResponse } from "../types/Auth";

export async function login(username: string, password: string): Promise<LoginResponse> {
  return http<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}
