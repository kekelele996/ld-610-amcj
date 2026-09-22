import type { Request, Response } from "express";
import { authService } from "../services/AuthService";
import { BusinessError } from "../utils/BusinessError";
import { asyncHandler } from "../utils/asyncHandler";

/** controller 层负责请求校验并二次包装异常，service 层包装业务异常 */
export const authController = {
  login: asyncHandler((req: Request, res: Response) => {
    const { username, password } = (req.body ?? {}) as { username?: unknown; password?: unknown };
    if (typeof username !== "string" || typeof password !== "string") {
      throw new BusinessError("VALIDATION_FAILED", { reason: "username and password are required" });
    }
    res.json(authService.login(username, password));
  })
};
