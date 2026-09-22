export type RoleName = "RESTORER" | "EXPERT" | "ARCHIVIST" | "VISITOR";

export interface AuthUser {
  id: number;
  username: string;
  display_name: string;
  role: RoleName;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
