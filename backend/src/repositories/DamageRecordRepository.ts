import { db, clone } from "./db";
import type { DamageRecord } from "../models/DamageRecord";

export const damageRecordRepository = {
  findAll: (): DamageRecord[] => clone(db.damageRecord),
  findById: (id: number): DamageRecord | null => {
    const row = db.damageRecord.find((item) => item.id === id);
    return row ? clone(row) : null;
  },
  save: (row: DamageRecord): DamageRecord => clone(row)
};
