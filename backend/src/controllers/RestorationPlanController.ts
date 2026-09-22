import type { Request, Response, NextFunction } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";
import type { AuthenticatedRequest } from "../types/AuthUser";
import type { PlanApprovalPayload, RestorationPlanPayload } from "../types/RestorationPlanPayload";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { validationError } from "../utils/errors";

// controller 层仅做参数校验与调用包装，业务失败原因由 service 抛出、errorHandler 统一返回
export const restorationPlanController = {
  list: (_req: Request, res: Response) => {
    res.json(restorationPlanService.list());
  },

  detail: (req: Request, res: Response) => {
    res.json(restorationPlanService.detail(req.params.id));
  },

  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = (req as AuthenticatedRequest).user;
      if (!actor) throw validationError(ERROR_MESSAGES.AUTH_REQUIRED);
      res.status(201).json(restorationPlanService.create(actor, req.body as RestorationPlanPayload));
    } catch (error) {
      next(error);
    }
  },

  // 审批/退回/归档统一入口，动作合法性在 service 中校验，越权返回 RBAC_DENIED
  approve: (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = (req as AuthenticatedRequest).user;
      if (!actor) throw validationError(ERROR_MESSAGES.AUTH_REQUIRED);
      res.json(restorationPlanService.approve(actor, req.params.id, req.body as PlanApprovalPayload));
    } catch (error) {
      next(error);
    }
  }
};
