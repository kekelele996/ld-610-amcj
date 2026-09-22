import type { Request, Response } from "express";
import { relicItemService } from "../services/RelicItemService";
import { asyncHandler } from "../utils/asyncHandler";

export const relicItemController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(relicItemService.list());
  }),

  /** 文物档案：展示方案审批链、退回原因与步骤执行进度 */
  archive: asyncHandler((req: Request, res: Response) => {
    const id = Number(req.params.id);
    res.json(relicItemService.getArchive(id, req.user));
  }),

  archives: asyncHandler((_req: Request, res: Response) => {
    res.json(relicItemService.listArchives());
  })
};
