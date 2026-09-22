import type { Request, Response } from "express";
import { damageRecordService } from "../services/DamageRecordService";
import { asyncHandler } from "../utils/asyncHandler";

export const damageRecordController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(damageRecordService.list());
  }),
  create: asyncHandler((req: Request, res: Response) => {
    res.status(201).json(damageRecordService.create(req.user!, req.body ?? {}));
  })
};
