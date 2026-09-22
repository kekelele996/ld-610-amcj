import { request } from "./client";
import type { UserRole } from "../constants/UserRole";

export interface LoginUser {
  id: number;
  name: string;
  role: UserRole;
  login: string;
}

interface LoginResponse {
  token: string;
  user: LoginUser;
}

export const login = (loginName: string) =>
  request<LoginResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ login: loginName }) });

export const listAccounts = () => request<Array<{ login: string; name: string; role: UserRole }>>("/api/auth/accounts");
