import { create } from "zustand";
import {
  listRestorationPlan,
  submitPlanApproval,
  createRestorationPlan,
  type PlanApprovalRequest
} from "../api/RestorationPlan";
import type { RestorationPlan } from "../types/RestorationPlan";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { ApiError } from "../api/client";

interface State {
  rows: RestorationPlan[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  // 审批/退回/归档：失败时设置 error（含后端明确失败原因），并向上抛出供页面提示
  approve: (id: number, payload: PlanApprovalRequest) => Promise<RestorationPlan>;
  create: (payload: {
    relic_id: number;
    damage_record_id: number;
    plan_title: string;
    method: string;
    risk_assessment: string;
  }) => Promise<RestorationPlan>;
  clearError: () => void;
}

const APPROVAL_LOG_INDEX: Record<PlanApprovalRequest["action"], number> = {
  SUBMIT: 2,
  APPROVE: 3,
  REJECT: 4,
  ARCHIVE: 5
};

export const useRestorationPlanStore = create<State>((set) => ({
  rows: [],
  loading: false,
  error: null,

  async load() {
    set({ loading: true, error: null });
    try {
      set({ rows: await listRestorationPlan(), loading: false });
    } catch (error) {
      set({ loading: false, error: (error as ApiError).message });
    }
  },

  async approve(id, payload) {
    set({ error: null });
    try {
      const updated = await submitPlanApproval(id, payload);
      const template = LOG_TEMPLATES.RestorationPlan[APPROVAL_LOG_INDEX[payload.action]];
      console.info("[audit:ui]", template, "plan#" + id, payload.reason ?? payload.comment ?? "");
      set((state) => ({ rows: state.rows.map((row) => (row.id === id ? updated : row)) }));
      return updated;
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message });
      throw apiError;
    }
  },

  async create(payload) {
    set({ error: null });
    try {
      const created = await createRestorationPlan(payload);
      console.info("[audit:ui]", LOG_TEMPLATES.RestorationPlan[0], created.plan_title);
      set((state) => ({ rows: [created, ...state.rows] }));
      return created;
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message });
      throw apiError;
    }
  },

  clearError() {
    set({ error: null });
  }
}));
