export const DamageStatus = ["OPEN", "IN_TREATMENT", "CLOSED"] as const;
export type DamageStatus = (typeof DamageStatus)[number];

export const DamageStatusText: Record<DamageStatus, string> = {
  OPEN: "待处理",
  IN_TREATMENT: "修复中",
  CLOSED: "已关闭"
};
