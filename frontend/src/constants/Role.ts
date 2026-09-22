export const ROLES = ["RESTORER", "EXPERT", "ARCHIVIST", "VISITOR"] as const;
export type RoleName = (typeof ROLES)[number];

export const RoleText: Record<RoleName, string> = {
  RESTORER: "修复师",
  EXPERT: "专家审批",
  ARCHIVIST: "档案员",
  VISITOR: "访客"
};

/** 演示账号说明（登录页一键填充），与后端种子用户一致 */
export const DEMO_ACCOUNTS: { username: string; password: string; role: RoleName }[] = [
  { username: "restorer", password: "relic123", role: "RESTORER" },
  { username: "expert", password: "relic123", role: "EXPERT" },
  { username: "archivist", password: "relic123", role: "ARCHIVIST" },
  { username: "visitor", password: "relic123", role: "VISITOR" }
];
