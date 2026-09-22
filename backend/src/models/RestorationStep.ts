import type { StepExecutionStatus } from "../constants/StepExecutionStatus";

export interface RestorationStep {
  id: number;
  plan_id: number;
  // 步骤序号，决定执行顺序，数字越小越先执行
  step_order: number;
  technique: string;
  material_used: string;
  operator_id: number;
  operator_name: string;
  step_status: StepExecutionStatus;
  started_at: string | null;
  finished_at: string | null;
  // 完成质检备注
  quality_note: string;
  created_at: string;
  updated_at: string;
}

// 档案中展示的方案修复进度
export interface PlanProgress {
  total: number;
  pending: number;
  in_progress: number;
  finished: number;
  percent: number;
  // 是否所有步骤均已完成（无步骤时为 false）
  all_finished: boolean;
}
