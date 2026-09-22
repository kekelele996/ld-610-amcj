import { db, clone } from "./db";
import type { RestorationStep } from "../models/RestorationStep";

export const restorationStepRepository = {
  findAll: (): RestorationStep[] => clone(db.restorationStep),
  findById: (id: number): RestorationStep | null => {
    const row = db.restorationStep.find((item) => item.id === id);
    return row ? clone(row) : null;
  },
  findByPlanId: (planId: number): RestorationStep[] =>
    clone(
      db.restorationStep
        .filter((item) => item.plan_id === planId)
        .sort((a, b) => a.step_order - b.step_order)
    ),
  countByPlanId: (planId: number) => db.restorationStep.filter((item) => item.plan_id === planId).length,
  update: (id: number, patch: Partial<RestorationStep>): RestorationStep | null => {
    const index = db.restorationStep.findIndex((item) => item.id === id);
    if (index < 0) return null;
    db.restorationStep[index] = { ...db.restorationStep[index], ...patch };
    return clone(db.restorationStep[index]);
  },
  insert: (row: Omit<RestorationStep, "id">): RestorationStep => {
    const created: RestorationStep = {
      ...row,
      id: Math.max(0, ...db.restorationStep.map((item) => item.id)) + 1
    };
    db.restorationStep.push(created);
    return clone(created);
  }
};
