import { config } from "../config/env";
import { userRepository } from "../repositories/UserRepository";
import { signToken } from "../utils/jwt";
import { BusinessError } from "../utils/BusinessError";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { renderTemplate, toAuditTarget } from "../utils/formatters";
import { auditLogService } from "./AuditLogService";
import type { AuthUser } from "../types/express";

export const authService = {
  login(username: unknown, password: unknown): { token: string; user: AuthUser } {
    if (typeof username !== "string" || typeof password !== "string" || !username.trim()) {
      throw new BusinessError("VALIDATION_FAILED", { reason: "username and password are required strings" });
    }
    const user = userRepository.findByUsername(username.trim());
    // 本地演示：种子用户 + 统一演示口令
    if (!user || password !== config.demoPassword) {
      throw new BusinessError("AUTH_INVALID_CREDENTIALS", {}, 401);
    }
    const token = signToken(
      { sub: user.id, username: user.username, display_name: user.display_name, role: user.role },
      config.jwtSecret
    );
    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      role: user.role
    };
    auditLogService.record(
      authUser,
      renderTemplate(LOG_TEMPLATES.Auth[0], { actor: user.username, role: user.role }),
      "User",
      toAuditTarget("User", user.id)
    );
    return { token, user: authUser };
  }
};
