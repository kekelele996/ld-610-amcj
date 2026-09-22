export const DamageSeverity = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type DamageSeverity = (typeof DamageSeverity)[number];
export const DamageSeverityText: Record<DamageSeverity, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  CRITICAL: "严重"
};
