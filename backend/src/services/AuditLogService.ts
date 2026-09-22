import { auditLogRepository } from "../repositories/AuditLogRepository";
import type { AuditLog } from "../models/AuditLog";
import type { AuthUser } from "../types/express";

/** 操作日志：方案审批、步骤执行、影像归档等所有写操作都必须经过这里留痕 */
export const auditLogService = {
  record(actor: AuthUser | undefined, action: string, targetType: string, targetId: string | number, detail = ""): AuditLog {
    return auditLogRepository.insert({
      actor_id: actor?.id ?? null,
      actor_name: actor?.display_name ?? "anonymous",
      role: actor?.role ?? null,
      action,
      target_type: targetType,
      target_id: String(targetId),
      detail,
      created_at: new Date().toISOString()
    });
  },
  list(): AuditLog[] {
    return auditLogRepository.findAll().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }
};
