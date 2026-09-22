import type { RequestHandler } from "express";
import { BusinessError } from "../utils/BusinessError";
import type { Role } from "../constants/Role";

/**
 * RBAC：任何越权操作都带着明确失败原因（RBAC_DENIED + 所需/实际角色）返回，
 * 由 errorHandlerMiddleware 统一成型为错误响应。
 */
export const rbacMiddleware =
  (roles: readonly Role[], action = "access"): RequestHandler =>
  (req, _res, next) => {
    const user = req.user;
    if (!user) {
      return next(new BusinessError("AUTH_REQUIRED", {}, 401));
    }
    if (!roles.includes(user.role)) {
      return next(
        new BusinessError(
          "RBAC_DENIED",
          { action, required: roles.join("|"), role: user.role },
          403
        )
      );
    }
    next();
  };
