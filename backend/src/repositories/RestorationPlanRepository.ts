import { db, clone } from "./db";
import type { ApprovalRecord, RestorationPlan } from "../models/RestorationPlan";

export const restorationPlanRepository = {
  findAll: (): RestorationPlan[] => clone(db.restorationPlan),
  findById: (id: number): RestorationPlan | null => {
    const row = db.restorationPlan.find((item) => item.id === id);
    return row ? clone(row) : null;
  },
  /** 仓储层只做持久化；状态机校验在 service 层完成 */
  update: (id: number, patch: Partial<RestorationPlan>): RestorationPlan | null => {
    const index = db.restorationPlan.findIndex((item) => item.id === id);
    if (index < 0) return null;
    db.restorationPlan[index] = { ...db.restorationPlan[index], ...patch };
    return clone(db.restorationPlan[index]);
  },
  insert: (row: Omit<RestorationPlan, "id"> & { id?: number }): RestorationPlan => {
    const created = { ...row, id: row.id ?? Math.max(0, ...db.restorationPlan.map((item) => item.id)) + 1 } as RestorationPlan;
    db.restorationPlan.push(created);
    return clone(created);
  }
};

export const approvalRecordRepository = {
  findByPlanId: (planId: number): ApprovalRecord[] =>
    clone(db.approvalRecord.filter((item) => item.plan_id === planId)),
  findAll: (): ApprovalRecord[] => clone(db.approvalRecord),
  insert: (row: Omit<ApprovalRecord, "id">): ApprovalRecord => {
    const created: ApprovalRecord = {
      ...row,
      id: Math.max(0, ...db.approvalRecord.map((item) => item.id)) + 1
    };
    db.approvalRecord.push(created);
    return clone(created);
  }
};
