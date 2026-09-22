// 所有写操作都必须命中日志模板；字段/状态变更时同步改调用处
export const LOG_TEMPLATES = {
  RelicItem: ["RelicItem.create", "RelicItem.update", "RelicItem.status", "RelicItem.export"],
  DamageRecord: ["DamageRecord.create", "DamageRecord.update", "DamageRecord.status", "DamageRecord.export"],
  RestorationPlan: [
    "RestorationPlan.create",
    "RestorationPlan.update",
    "RestorationPlan.submit",
    "RestorationPlan.approve",
    "RestorationPlan.reject",
    "RestorationPlan.archive",
    "RestorationPlan.export"
  ],
  RestorationStep: [
    "RestorationStep.create",
    "RestorationStep.start",
    "RestorationStep.finish",
    "RestorationStep.update",
    "RestorationStep.status",
    "RestorationStep.export"
  ],
  ImageVersion: ["ImageVersion.create", "ImageVersion.update", "ImageVersion.status", "ImageVersion.export"]
} as const;

// 审批与执行链的可读日志模板，供 service 与 auditLogMiddleware 共同引用
export const AUDIT_MESSAGE_TEMPLATES = {
  planCreate: (title: string) => `修复方案创建：${title}`,
  planSubmit: (id: number) => `修复方案送审：plan#${id}`,
  planApprove: (id: number, actor: string) => `修复方案审批通过：plan#${id}，审批人=${actor}`,
  planReject: (id: number, actor: string, reason: string) =>
    `修复方案退回待审：plan#${id}，审批人=${actor}，退回原因=${reason}`,
  planArchive: (id: number, actor: string) => `修复方案归档：plan#${id}，档案员=${actor}`,
  stepCreate: (planId: number, order: number) =>
    `修复步骤登记：plan#${planId} 第${order}步`,
  stepStart: (id: number, planId: number) =>
    `修复步骤开始执行：step#${id}（plan#${planId}）`,
  stepFinish: (id: number, planId: number) =>
    `修复步骤完成：step#${id}（plan#${planId}）`
} as const;
