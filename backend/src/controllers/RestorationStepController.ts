import type { Request, Response, NextFunction } from "express";
import { restorationStepService } from "../services/RestorationStepService";
import type { AuthenticatedRequest } from "../types/AuthUser";
import type { RestorationStepPayload } from "../types/RestorationStepPayload";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { validationError } from "../utils/errors";

export const restorationStepController = {
  list: (req: Request, res: Response) => {
    res.json(restorationStepService.list(req.query.plan_id as string | undefined));
  },

  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = (req as AuthenticatedRequest).user;
      if (!actor) throw validationError(ERROR_MESSAGES.AUTH_REQUIRED);
      res.status(201).json(restorationStepService.create(actor, req.body as RestorationStepPayload));
    } catch (error) {
      next(error);
    }
  },

  start: (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = (req as AuthenticatedRequest).user;
      if (!actor) throw validationError(ERROR_MESSAGES.AUTH_REQUIRED);
      res.json(restorationStepService.start(actor, req.params.id));
    } catch (error) {
      next(error);
    }
  },

  finish: (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = (req as AuthenticatedRequest).user;
      if (!actor) throw validationError(ERROR_MESSAGES.AUTH_REQUIRED);
      res.json(restorationStepService.finish(actor, req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  },

  progress: (req: Request, res: Response) => {
    res.json(restorationStepService.progress(req.params.planId));
  }
};
