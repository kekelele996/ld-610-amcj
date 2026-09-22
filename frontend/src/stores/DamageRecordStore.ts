import { create } from "zustand";
import { listDamageRecord } from "../api/DamageRecord";
import { ApiError } from "../api/http";
import type { DamageRecord } from "../types/DamageRecord";

type State = { rows: DamageRecord[]; loading: boolean; error: string | null; load: () => Promise<void> };

export const useDamageRecordStore = create<State>((set) => ({
  rows: [],
  loading: false,
  error: null,
  async load() {
    set({ loading: true, error: null });
    try {
      set({ rows: await listDamageRecord() });
    } catch (error) {
      set({ error: error instanceof ApiError ? error.displayMessage : (error as Error).message });
    } finally {
      set({ loading: false });
    }
  }
}));
