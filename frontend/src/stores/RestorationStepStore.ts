import { create } from "zustand";
import {
  listRestorationStep,
  registerRestorationStep,
  startRestorationStep,
  finishRestorationStep
} from "../api/RestorationStep";
import type { RestorationStep } from "../types/RestorationStep";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { ApiError } from "../api/client";

interface State {
  rows: RestorationStep[];
  loading: boolean;
  error: string | null;
  load: (planId?: number) => Promise<void>;
  // 登记步骤：方案未通过/被退回时，后端返回明确失败原因
  register: (payload: { plan_id: number; technique: string; material_used?: string }) => Promise<RestorationStep | ApiError>;
  start: (id: number) => Promise<RestorationStep | ApiError>;
  finish: (id: number, quality_note?: string) => Promise<RestorationStep | ApiError>;
  clearError: () => void;
}

const fail = (error: unknown): ApiError => error as ApiError;

const captureError = (set: (partial: Partial<State>) => void, error: unknown): ApiError => {
  const apiError = error as ApiError;
  set({ error: apiError.message });
  return apiError;
};

export const useRestorationStepStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  error: null,

  async load(planId) {
    set({ loading: true, error: null });
    try {
      set({ rows: await listRestorationStep(planId), loading: false });
    } catch (error) {
      set({ loading: false, error: (error as ApiError).message });
    }
  },

  async register(payload) {
    set({ error: null });
    try {
      const created = await registerRestorationStep(payload);
      console.info("[audit:ui]", LOG_TEMPLATES.RestorationStep[0], "plan#" + payload.plan_id);
      set({ rows: [...get().rows, created].sort((a, b) => a.step_order - b.step_order) });
      return created;
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message });
      throw apiError;
    }
  },

  async start(id) {
    set({ error: null });
    try {
      const updated = await startRestorationStep(id);
      console.info("[audit:ui]", LOG_TEMPLATES.RestorationStep[1], "step#" + id);
      set({ rows: get().rows.map((row) => (row.id === id ? updated : row)) });
      return updated;
    } catch (error) {
      return captureError(set, error);
    }
  },

  async finish(id, quality_note) {
    set({ error: null });
    try {
      const updated = await finishRestorationStep(id, quality_note);
      console.info("[audit:ui]", LOG_TEMPLATES.RestorationStep[2], "step#" + id);
      set({ rows: get().rows.map((row) => (row.id === id ? updated : row)) });
      return updated;
    } catch (error) {
      return captureError(set, error);
    }
  },

  clearError() {
    set({ error: null });
  }
}));
