import type { Request, Response, NextFunction } from "express";
import { DEMO_ACCOUNTS, signAuthToken } from "../utils/auth";
import { validationError } from "../utils/errors";

// 本地账号登录：发放 JWT，前端切换角色用于演示审批与执行链
export const authController = {
  login(req: Request, res: Response, next: NextFunction) {
    try {
      const login = String(req.body?.login ?? "").trim();
      const account = DEMO_ACCOUNTS.find((row) => row.login === login);
      if (!account) {
        throw validationError(`登录失败：账号「${login}」不存在，可选：${DEMO_ACCOUNTS.map((a) => a.login).join("、")}`);
      }
      const token = signAuthToken(account);
      res.json({
        token,
        user: { id: account.id, name: account.name, role: account.role, login: account.login }
      });
    } catch (error) {
      next(error);
    }
  },

  accounts: (_req: Request, res: Response) => {
    res.json(DEMO_ACCOUNTS.map(({ login, name, role }) => ({ login, name, role })));
  }
};
