import { request } from "./client";
import type { UserRole } from "../constants/UserRole";

export interface AuditLog {
  id: number;
  actor_id: number | null;
  actor_name: string;
  actor_role: UserRole | null;
  action: string;
  target_type: string;
  target_id: string;
  message: string;
  created_at: string;
}

export const listAuditLogs = () => request<AuditLog[]>("/api/audit-log");
