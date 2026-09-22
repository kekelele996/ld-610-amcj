import { db, clone } from "./db";
import type { AuditLog } from "../models/AuditLog";

export const auditLogRepository = {
  findAll: (): AuditLog[] => clone(db.auditLog),
  insert: (row: Omit<AuditLog, "id">): AuditLog => {
    const created: AuditLog = { ...row, id: Math.max(0, ...db.auditLog.map((item) => item.id)) + 1 };
    db.auditLog.push(created);
    return clone(created);
  }
};
