import type { RelicItem } from "../models/RelicItem";
import type { RestorationPlanDetailDto } from "./RestorationPlanDtoFactory";

export interface RelicArchiveDto extends RelicItem {
  plans: RestorationPlanDetailDto[];
  plan_count: number;
  overall_percent: number;
  image_count: number;
}

/** 文物档案响应：聚合方案审批状态与步骤进度，供 /api/relic-item/:id/archive */
export const createRelicArchiveDto = (
  relic: RelicItem,
  plans: RestorationPlanDetailDto[],
  imageCount: number
): RelicArchiveDto => {
  const totalSteps = plans.reduce((sum, plan) => sum + plan.progress.total, 0);
  const completedSteps = plans.reduce((sum, plan) => sum + plan.progress.completed, 0);
  return {
    ...relic,
    plans,
    plan_count: plans.length,
    overall_percent: totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100),
    image_count: imageCount
  };
};
