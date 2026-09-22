import { seed } from "../seed";
import type { RestorationPlan, ApprovalRecord } from "../models/RestorationPlan";
import type { PlanApprovalStatus } from "../constants/PlanApprovalStatus";

// 内存数据表：进程内可变，重启后由种子数据重建
const plans: RestorationPlan[] = seed.restorationPlan.map((row) => ({
  ...row,
  approval_records: row.approval_records.map((record) => ({ ...record }))
}));

let approvalRecordSeq = Math.max(0, ...plans.flatMap((p) => p.approval_records.map((r) => r.id)));

const clone = (plan: RestorationPlan): RestorationPlan => ({
  ...plan,
  approval_records: plan.approval_records.map((r) => ({ ...r }))
});

export const restorationPlanRepository = {
  findAll(): RestorationPlan[] {
    return plans.map(clone);
  },

  findById(id: number): RestorationPlan | undefined {
    const plan = plans.find((row) => row.id === id);
    return plan ? clone(plan) : undefined;
  },

  // 仓库内部使用的可变引用，仅供 service 在同一业务动作内连续更新
  peekById(id: number): RestorationPlan | undefined {
    return plans.find((row) => row.id === id);
  },

  save(row: RestorationPlan): RestorationPlan {
    const id = row.id || Date.now();
    const stored: RestorationPlan = { ...row, id, approval_records: row.approval_records.map((r) => ({ ...r })) };
    plans.push(stored);
    return clone(stored);
  },

  appendApprovalRecord(plan: RestorationPlan, record: Omit<ApprovalRecord, "id">): ApprovalRecord {
    const target = plans.find((row) => row.id === plan.id);
    if (!target) throw new Error(`plan ${plan.id} not found`);
    const stored: ApprovalRecord = { ...record, id: ++approvalRecordSeq };
    target.approval_records.push(stored);
    return { ...stored };
  },

  updateStatus(
    id: number,
    patch: Partial<Pick<RestorationPlan, "approval_status" | "rejection_reason" | "submitted_at" | "approved_at" | "rejected_at" | "archived_at" | "updated_at">>
  ): RestorationPlan {
    const target = plans.find((row) => row.id === id);
    if (!target) throw new Error(`plan ${id} not found`);
    Object.assign(target, patch);
    return clone(target);
  }
};

export type { PlanApprovalStatus };
