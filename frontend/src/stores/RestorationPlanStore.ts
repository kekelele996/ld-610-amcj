import { create } from "zustand";
import {
  listRestorationPlan,
  submitRestorationPlan,
  approveRestorationPlan,
  rejectRestorationPlan,
  archiveRestorationPlan,
  reviseRestorationPlan
} from "../api/RestorationPlan";
import {
  registerRestorationStep,
  startRestorationStep,
  completeRestorationStep
} from "../api/RestorationStep";
import { ApiError } from "../api/http";
import type { RestorationPlanDetail } from "../types/RestorationPlan";

interface PlanState {
  rows: RestorationPlanDetail[];
  loading: boolean;
  acting: boolean;
  error: string | null;
  load: () => Promise<void>;
  clearError: () => void;
  submit: (id: number, comment?: string) => Promise<boolean>;
  approve: (id: number, comment?: string) => Promise<boolean>;
  reject: (id: number, reason: string) => Promise<boolean>;
  archive: (id: number) => Promise<boolean>;
  revise: (id: number, patch: { method?: string; risk_assessment?: string }) => Promise<boolean>;
  registerStep: (planId: number, technique: string, materialUsed: string) => Promise<boolean>;
  startStep: (stepId: number) => Promise<boolean>;
  completeStep: (stepId: number, materialUsed?: string) => Promise<boolean>;
}

/**
 * 所有审批/执行动作统一从这里发起：
 * 失败时保留后端的明确原因（ApiError.displayMessage），成功后重新拉取最新链路。
 */
export const useRestorationPlanStore = create<PlanState>((set, get) => ({
  rows: [],
  loading: false,
  acting: false,
  error: null,

  async load() {
    set({ loading: true, error: null });
    try {
      set({ rows: await listRestorationPlan() });
    } catch (error) {
      set({ error: error instanceof ApiError ? error.displayMessage : (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  clearError() {
    set({ error: null });
  },

  submit: (id, comment) => runAction(set, get, () => submitRestorationPlan(id, comment)),
  approve: (id, comment) => runAction(set, get, () => approveRestorationPlan(id, comment)),
  reject: (id, reason) => runAction(set, get, () => rejectRestorationPlan(id, reason)),
  archive: (id) => runAction(set, get, () => archiveRestorationPlan(id)),
  revise: (id, patch) => runAction(set, get, () => reviseRestorationPlan(id, patch)),

  registerStep: (planId, technique, materialUsed) =>
    runAction(set, get, () => registerRestorationStep({ plan_id: planId, technique, material_used: materialUsed })),
  startStep: (stepId) => runAction(set, get, () => startRestorationStep(stepId)),
  completeStep: (stepId, materialUsed) =>
    runAction(set, get, () => completeRestorationStep(stepId, materialUsed))
}));

async function runAction(
  set: (partial: Partial<PlanState>) => void,
  get: () => PlanState,
  fn: () => Promise<unknown>
): Promise<boolean> {
  set({ acting: true, error: null });
  try {
    await fn();
    await get().load();
    return true;
  } catch (error) {
    set({ error: error instanceof ApiError ? error.displayMessage : (error as Error).message });
    return false;
  } finally {
    set({ acting: false });
  }
}
