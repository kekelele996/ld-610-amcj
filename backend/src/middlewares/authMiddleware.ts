import type { RequestHandler } from "express";
import { config } from "../config/env";
import { verifyToken } from "../utils/jwt";
import { BusinessError } from "../utils/BusinessError";
import { ROLES, type Role } from "../constants/Role";
import { userRepository } from "../repositories/UserRepository";

/** 不携带用户身份的公开路径 */
const PUBLIC_PATHS = ["/health", "/api/auth/login"];

export const authMiddleware: RequestHandler = (req, _res, next) => {
  if (PUBLIC_PATHS.includes(req.path)) return next();

  const headerValue = req.header("authorization") ?? "";
  const [scheme, token] = headerValue.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new BusinessError("AUTH_REQUIRED", {}, 401));
  }

  try {
    const payload = verifyToken(token, config.jwtSecret);
    if (!ROLES.includes(payload.role as Role)) {
      throw new Error("unknown role");
    }
    // 以本地用户表为准解析中文姓名，保证审批记录/审计日志 actor_name 可追溯
    const account = userRepository.findById(payload.sub);
    req.user = {
      id: payload.sub,
      username: payload.username,
      display_name: account?.display_name ?? payload.username,
      role: payload.role as Role
    };
    next();
  } catch (error) {
    next(new BusinessError("AUTH_TOKEN_INVALID", { reason: (error as Error).message }, 401));
  }
};
