import type { RestorationPlanDetail } from "./RestorationPlan";
import type { RelicItem } from "./RelicItem";

export interface RelicArchive extends RelicItem {
  plans: RestorationPlanDetail[];
  plan_count: number;
  overall_percent: number;
  image_count: number;
}
