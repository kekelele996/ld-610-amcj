import type { StepStatusValue } from "../constants/StepStatus";

export interface RestorationStep {
  id: number;
  plan_id: number;
  step_order: number;
  technique: string;
  material_used: string;
  operator_id: number | null;
  step_status: StepStatusValue;
  registered_at: string;
  started_at: string | null;
  finished_at: string | null;
}
