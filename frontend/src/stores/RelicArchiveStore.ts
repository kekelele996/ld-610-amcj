import { create } from "zustand";
import { listRelicArchives } from "../api/RelicItem";
import { ApiError } from "../api/http";
import type { RelicArchive } from "../types/RelicArchive";

type State = {
  rows: RelicArchive[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
};

/** 文物档案 store：档案页展示每个方案审批状态、退回原因与步骤进度 */
export const useRelicArchiveStore = create<State>((set) => ({
  rows: [],
  loading: false,
  error: null,
  async load() {
    set({ loading: true, error: null });
    try {
      set({ rows: await listRelicArchives() });
    } catch (error) {
      set({ error: error instanceof ApiError ? error.displayMessage : (error as Error).message });
    } finally {
      set({ loading: false });
    }
  }
}));
