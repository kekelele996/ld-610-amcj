export const PlanApprovalStatus = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "ARCHIVED"] as const;
export type PlanApprovalStatus = (typeof PlanApprovalStatus)[number];

export const PlanApprovalStatusText: Record<PlanApprovalStatus, string> = {
  DRAFT: "草稿",
  SUBMITTED: "待审批",
  APPROVED: "已通过",
  REJECTED: "退回待审",
  ARCHIVED: "已归档"
};

// 状态流转说明：用于页面提示，明确“通过后才能执行、退回后冻结”
export const PlanApprovalStatusHint: Record<PlanApprovalStatus, string> = {
  DRAFT: "方案编制中，送审并经专家通过后才能登记步骤",
  SUBMITTED: "待专家审批，审批期间不可登记或执行步骤",
  APPROVED: "专家已通过，修复师可登记并按原步骤顺序执行",
  REJECTED: "方案被退回待审，既有步骤保留但禁止继续执行；修改后重新送审，通过后按原步骤继续",
  ARCHIVED: "方案已归档，步骤全部完成，禁止再执行"
};
