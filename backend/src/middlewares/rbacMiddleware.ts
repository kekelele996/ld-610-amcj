import type { RequestHandler } from "express";
import { UserRoleText } from "../constants/UserRole";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { AuthenticatedRequest } from "../types/AuthUser";
import { BusinessError } from "../utils/errors";

// RBAC：路由级角色门禁；service 内针对具体动作再做一次精确校验（双保险，禁止跳过审批）
export const rbacMiddleware = (roles: string[] = []): RequestHandler => (req, _res, next) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return next(new BusinessError("AUTH_REQUIRED", ERROR_MESSAGES.AUTH_REQUIRED, 401));
  }
  if (roles.length > 0 && !roles.includes(user.role)) {
    return next(
      new BusinessError(
        "RBAC_DENIED",
        `${ERROR_MESSAGES.RBAC_DENIED}：当前角色「${UserRoleText[user.role]}」无权访问 ${req.method} ${req.path}，允许角色：${roles.join("、")}`,
        403
      )
    );
  }
  next();
};
