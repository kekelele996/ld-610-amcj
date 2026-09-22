import type { Request, Response } from "express";
import { auditLogService } from "../services/AuditLogService";
import { asyncHandler } from "../utils/asyncHandler";

export const auditLogController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(auditLogService.list());
  })
};
