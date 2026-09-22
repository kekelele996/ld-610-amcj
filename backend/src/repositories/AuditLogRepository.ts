import type { AuditLog } from "../models/AuditLog";
import type { AuthUser } from "../types/AuthUser";

// 操作日志内存表（对应数据库 audit_log 表）
const logs: AuditLog[] = [];
let logSeq = 0;

export interface AuditEntryInput {
  actor?: AuthUser;
  action: string;
  target_type: string;
  target_id: string | number;
  message: string;
}

export const auditLogRepository = {
  record(input: AuditEntryInput): AuditLog {
    const row: AuditLog = {
      id: ++logSeq,
      actor_id: input.actor?.id ?? null,
      actor_name: input.actor?.name ?? "匿名",
      actor_role: input.actor?.role ?? null,
      action: input.action,
      target_type: input.target_type,
      target_id: String(input.target_id),
      message: input.message,
      created_at: new Date().toISOString()
    };
    logs.push(row);
    return { ...row };
  },

  findAll(): AuditLog[] {
    return logs.map((row) => ({ ...row })).reverse();
  }
};
