import type { RequestHandler } from "express";
import type { AuthenticatedRequest } from "../types/AuthUser";

// 写操作 HTTP 层审计：记录方法与路径；业务明细（含退回原因）由 service 调 auditLogRepository 落库
export const auditLogMiddleware: RequestHandler = (req, _res, next) => {
  if (req.method !== "GET" && req.path.startsWith("/api") && req.path !== "/api/auth/login") {
    const user = (req as AuthenticatedRequest).user;
    console.info("[audit]", req.method, req.path, user ? `actor=${user.name}(${user.role})` : "anonymous");
  }
  next();
};
