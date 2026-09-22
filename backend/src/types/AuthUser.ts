import type { UserRole } from "../constants/UserRole";

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
}

// Express 请求上的当前登录用户，由 authMiddleware 注入
export interface AuthenticatedRequest {
  user?: AuthUser;
}
