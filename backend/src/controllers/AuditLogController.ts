import type { Request, Response } from "express";
import { auditLogRepository } from "../repositories/AuditLogRepository";

export const auditLogController = {
  list: (_req: Request, res: Response) => {
    res.json(auditLogRepository.findAll());
  }
};
