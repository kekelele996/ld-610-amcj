import type { Request, Response } from "express";
import { imageVersionService } from "../services/ImageVersionService";
import { asyncHandler } from "../utils/asyncHandler";

export const imageVersionController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(imageVersionService.list());
  }),
  create: asyncHandler((req: Request, res: Response) => {
    res.status(201).json(imageVersionService.create(req.user!, req.body ?? {}));
  })
};
