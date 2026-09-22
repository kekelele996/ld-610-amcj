import type { UserRole } from "../constants/UserRole";

// 操作日志：方案审批、影像归档、病害关闭等写操作均需落日志
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
