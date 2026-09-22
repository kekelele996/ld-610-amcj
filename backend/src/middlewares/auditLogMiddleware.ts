import type { RequestHandler } from "express";

/** 访问审计：登录后每个写请求都留痕，业务动作另有 service 层细粒度审计 */
export const auditLogMiddleware: RequestHandler = (req, _res, next) => {
  if (req.method !== "GET") {
    const actor = req.user ? `${req.user.username}(${req.user.role})` : "anonymous";
    console.info("audit-write", actor, req.method, req.originalUrl);
  }
  next();
};
