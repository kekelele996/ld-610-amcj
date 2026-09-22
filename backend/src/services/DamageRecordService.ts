import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { nextId } from "../repositories/db";
import { db } from "../repositories/db";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { toAuditTarget } from "../utils/formatters";
import { auditLogService } from "./AuditLogService";
import { BusinessError } from "../utils/BusinessError";
import type { DamageRecord } from "../models/DamageRecord";
import type { AuthUser } from "../types/express";

export const damageRecordService = {
  list: () => damageRecordRepository.findAll(),

  create(user: AuthUser, body: Record<string, unknown>): DamageRecord {
    const relicId = Number(body.relic_id);
    const damageType = typeof body.damage_type === "string" ? body.damage_type.trim() : "";
    if (!relicId || !damageType) {
      throw new BusinessError("VALIDATION_FAILED", { reason: "relic_id and damage_type are required" });
    }
    const created: DamageRecord = {
      id: nextId(),
      relic_id: relicId,
      damage_type: damageType,
      position_desc: typeof body.position_desc === "string" ? body.position_desc.trim() : "",
      severity: typeof body.severity === "string" ? body.severity : "MEDIUM",
      discovered_by: user.display_name,
      discovered_at: new Date().toISOString(),
      image_url: typeof body.image_url === "string" ? body.image_url : "",
      status: "OPEN"
    };
    db.damageRecord.push(created);
    auditLogService.record(user, LOG_TEMPLATES.DamageRecord[0], "DamageRecord", toAuditTarget("DamageRecord", created.id), damageType);
    return { ...created };
  }
};
