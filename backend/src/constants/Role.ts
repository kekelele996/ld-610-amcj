export const ROLES = ["RESTORER", "EXPERT", "ARCHIVIST", "VISITOR"] as const;
export type Role = (typeof ROLES)[number];

export const RoleText: Record<Role, string> = {
  RESTORER: "修复师",
  EXPERT: "专家审批",
  ARCHIVIST: "档案员",
  VISITOR: "访客"
};

export const hasRole = (role: string, allowed: readonly string[]) => allowed.includes(role);
