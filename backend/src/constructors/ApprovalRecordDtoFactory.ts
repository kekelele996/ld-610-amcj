import type { ApprovalRecord } from "../models/RestorationPlan";

export const createApprovalRecordDto = (
  record: Omit<ApprovalRecord, "id">,
  overrides: Partial<ApprovalRecord> = {}
): ApprovalRecord => ({
  id: 0,
  ...record,
  ...overrides
});
