import type { Request, Response } from "express";
import { restorationStepService } from "../services/RestorationStepService";
import { asyncHandler } from "../utils/asyncHandler";

export const restorationStepController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(restorationStepService.list());
  }),

  // 修复师登记步骤：方案必须已 APPROVED，否则 service 抛 STEP_REGISTER_LOCKED
  register: asyncHandler((req: Request, res: Response) => {
    const created = restorationStepService.register(req.user!, req.body ?? {});
    res.status(201).json(created);
  }),

  start: asyncHandler((req: Request, res: Response) => {
    res.json(restorationStepService.start(req.user!, Number(req.params.id)));
  }),

  complete: asyncHandler((req: Request, res: Response) => {
    res.json(restorationStepService.complete(req.user!, Number(req.params.id), req.body ?? {}));
  })
};
