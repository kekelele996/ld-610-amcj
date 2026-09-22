import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { toAuditTarget } from "../utils/formatters";
import { auditLogService } from "./AuditLogService";
import { BusinessError } from "../utils/BusinessError";
import type { AuthUser } from "../types/express";

export const imageVersionService = {
  list: () => imageVersionRepository.findAll(),

  create(user: AuthUser, body: Record<string, unknown>) {
    const relicId = Number(body.relic_id);
    const filePath = typeof body.file_path === "string" ? body.file_path.trim() : "";
    if (!relicId || !filePath) {
      throw new BusinessError("VALIDATION_FAILED", { reason: "relic_id and file_path are required" });
    }
    const created = imageVersionRepository.insert({
      relic_id: relicId,
      plan_id: Number(body.plan_id ?? 0),
      version_no: typeof body.version_no === "string" ? body.version_no : `V${Date.now()}`,
      image_type: typeof body.image_type === "string" ? body.image_type : "EVIDENCE",
      file_path: filePath,
      capture_at: new Date().toISOString(),
      note: typeof body.note === "string" ? body.note : ""
    });
    auditLogService.record(user, LOG_TEMPLATES.ImageVersion[0], "ImageVersion", toAuditTarget("ImageVersion", created.id), created.image_type);
    return created;
  }
};
