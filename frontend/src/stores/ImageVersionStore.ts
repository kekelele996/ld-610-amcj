import { create } from "zustand";
import { listImageVersion } from "../api/ImageVersion";
import { ApiError } from "../api/http";
import type { ImageVersion } from "../types/ImageVersion";

type State = { rows: ImageVersion[]; loading: boolean; error: string | null; load: () => Promise<void> };

export const useImageVersionStore = create<State>((set) => ({
  rows: [],
  loading: false,
  error: null,
  async load() {
    set({ loading: true, error: null });
    try {
      set({ rows: await listImageVersion() });
    } catch (error) {
      set({ error: error instanceof ApiError ? error.displayMessage : (error as Error).message });
    } finally {
      set({ loading: false });
    }
  }
}));
