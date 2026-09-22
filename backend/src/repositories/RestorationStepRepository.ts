import { seed } from "../seed";
import type { RestorationStep } from "../models/RestorationStep";

// 内存数据表：方案退回时记录保留、状态冻结，恢复审批后继续按原步骤执行
const steps: RestorationStep[] = seed.restorationStep.map((row) => ({ ...row }));
let stepSeq = Math.max(0, ...steps.map((row) => row.id));

const clone = (step: RestorationStep): RestorationStep => ({ ...step });

export const restorationStepRepository = {
  findAll(): RestorationStep[] {
    return steps.map(clone);
  },

  findByPlanId(planId: number): RestorationStep[] {
    return steps.filter((row) => row.plan_id === planId).sort((a, b) => a.step_order - b.step_order).map(clone);
  },

  findById(id: number): RestorationStep | undefined {
    const step = steps.find((row) => row.id === id);
    return step ? clone(step) : undefined;
  },

  insert(row: Omit<RestorationStep, "id">): RestorationStep {
    const stored: RestorationStep = { ...row, id: ++stepSeq };
    steps.push(stored);
    return clone(stored);
  },

  update(id: number, patch: Partial<RestorationStep>): RestorationStep {
    const target = steps.find((row) => row.id === id);
    if (!target) throw new Error(`step ${id} not found`);
    Object.assign(target, patch);
    return clone(target);
  },

  nextOrderForPlan(planId: number): number {
    const owned = steps.filter((row) => row.plan_id === planId);
    return owned.length === 0 ? 1 : Math.max(...owned.map((row) => row.step_order)) + 1;
  }
};
