import type { RequestHandler } from "express";
import { verifyAuthToken } from "../utils/auth";
import type { AuthenticatedRequest } from "../types/AuthUser";
import { BusinessError } from "../utils/errors";

const PUBLIC_PATHS = new Set(["/health", "/api/auth/login"]);

// JWT 认证：登录接口与健康检查放行；其余 /api 必须携带有效 Bearer Token
export const authMiddleware: RequestHandler = (req, _res, next) => {
  if (req.path === "/health" || PUBLIC_PATHS.has(req.path)) {
    return next();
  }
  if (!req.path.startsWith("/api")) {
    return next();
  }
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return next(new BusinessError("AUTH_REQUIRED", "缺少身份凭证：请先登录并在 Authorization 头中携带 Bearer Token", 401));
  }
  const payload = verifyAuthToken(token);
  if (!["RESTORER", "EXPERT", "ARCHIVIST", "VISITOR"].includes(payload.role)) {
    return next(new BusinessError("AUTH_REQUIRED", "凭证中的角色非法", 401));
  }
  (req as unknown as AuthenticatedRequest).user = { id: payload.sub, name: payload.name, role: payload.role };
  next();
};
