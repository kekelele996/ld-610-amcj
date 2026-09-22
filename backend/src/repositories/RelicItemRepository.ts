import { db, clone } from "./db";
import type { RelicItem } from "../models/RelicItem";

export const relicItemRepository = {
  findAll: (): RelicItem[] => clone(db.relicItem),
  findById: (id: number): RelicItem | null => {
    const row = db.relicItem.find((item) => item.id === id);
    return row ? clone(row) : null;
  },
  save: (row: RelicItem): RelicItem => clone(row)
};
