import { db, clone, nextId } from "./db";
import type { ImageVersion } from "../models/ImageVersion";

export const imageVersionRepository = {
  findAll: (): ImageVersion[] => clone(db.imageVersion),
  findByRelicId: (relicId: number): ImageVersion[] =>
    clone(db.imageVersion.filter((item) => item.relic_id === relicId)),
  insert: (row: Omit<ImageVersion, "id">): ImageVersion => {
    const created = { ...row, id: nextId() };
    db.imageVersion.push(created);
    return clone(created);
  }
};
