import jwt from "jsonwebtoken";
import { UserRoleText } from "../constants/UserRole";
import type { UserRole as Role } from "../constants/UserRole";
import { BusinessError, forbiddenError } from "./errors";
import { ERROR_MESSAGES } from "../constants/errorMessages";

const JWT_SECRET = process.env.JWT_SECRET ?? "relic-restore-dev-secret";
export const JWT_EXPIRES_IN = "8h";

export interface JwtPayload {
  sub: number;
  name: string;
  role: Role;
}

export const signAuthToken = (user: { id: number; name: string; role: Role }): string =>
  jwt.sign({ sub: user.id, name: user.name, role: user.role } as JwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

export const verifyAuthToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
  } catch {
    throw new BusinessError("AUTH_REQUIRED", ERROR_MESSAGES.AUTH_REQUIRED, 401);
  }
};

// 越权操作统一在这里失败：错误码 RBAC_DENIED + 明确的角色/动作原因
export const assertRole = (actual: Role, allowed: Role[], actionLabel: string) => {
  if (!allowed.includes(actual)) {
    throw forbiddenError(
      "RBAC_DENIED",
      `${ERROR_MESSAGES.RBAC_DENIED}：角色「${UserRoleText[actual]}」不允许执行「${actionLabel}」`
    );
  }
};

// 本地演示账号：数据全部来自本地，禁止接入第三方
export const DEMO_ACCOUNTS: Array<{ id: number; name: string; role: Role; login: string }> = [
  { id: 2, name: "陆修复", role: "RESTORER", login: "restorer" },
  { id: 3, name: "沈专家", role: "EXPERT", login: "expert" },
  { id: 4, name: "韩档案", role: "ARCHIVIST", login: "archivist" },
  { id: 5, name: "访客", role: "VISITOR", login: "visitor" }
];
