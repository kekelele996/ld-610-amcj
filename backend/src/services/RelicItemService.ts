import { relicItemRepository } from "../repositories/RelicItemRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { restorationPlanService } from "./RestorationPlanService";
import { auditLogService } from "./AuditLogService";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { toAuditTarget } from "../utils/formatters";
import { BusinessError } from "../utils/BusinessError";
import { createRelicArchiveDto } from "../constructors/RelicArchiveDtoFactory";
import type { AuthUser } from "../types/express";

export const relicItemService = {
  list: () => relicItemRepository.findAll(),

  /** 档案视图：聚合每件文物下方案的审批状态与步骤进度 */
  getArchive(id: number, user?: AuthUser) {
    const relic = relicItemRepository.findById(id);
    if (!relic) throw new BusinessError("RELIC_NOT_FOUND", { id }, 404);
    const plans = restorationPlanRepository
      .findAll()
      .filter((plan) => plan.relic_id === id)
      .map((plan) => restorationPlanService.buildDetail(plan));
    const imageCount = imageVersionRepository.findByRelicId(id).length;
    if (user) {
      auditLogService.record(
        user,
        LOG_TEMPLATES.RelicItem[4],
        "RelicItem",
        toAuditTarget("RelicItem", id),
        `plans=${plans.length}`
      );
    }
    return createRelicArchiveDto(relic, plans, imageCount);
  },

  listArchives() {
    return relicItemRepository.findAll().map((relic) => this.getArchive(relic.id));
  }
};
