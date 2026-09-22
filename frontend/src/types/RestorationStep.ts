import type { StepExecutionStatus } from "../constants/StepExecutionStatus";

export interface RestorationStep {
  id: number;
  plan_id: number;
  step_order: number;
  technique: string;
  material_used: string;
  operator_id: number;
  operator_name: string;
  step_status: StepExecutionStatus;
  started_at: string | null;
  finished_at: string | null;
  quality_note: string;
  created_at: string;
  updated_at: string;
}
