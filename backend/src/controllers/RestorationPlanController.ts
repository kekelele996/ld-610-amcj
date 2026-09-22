import type { Request, Response } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";
import { asyncHandler } from "../utils/asyncHandler";
import { BusinessError } from "../utils/BusinessError";

const readComment = (req: Request): string => {
  const comment = (req.body ?? {}).comment;
  return typeof comment === "string" ? comment.trim() : "";
};

/** controller 负责参数校验与响应包装；越权/跳过审批的业务错误由 service 抛出 */
export const restorationPlanController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(restorationPlanService.listDetails());
  }),

  detail: asyncHandler((req: Request, res: Response) => {
    res.json(restorationPlanService.getDetail(Number(req.params.id)));
  }),

  create: asyncHandler((req: Request, res: Response) => {
    if (!req.user) throw new BusinessError("AUTH_REQUIRED", {}, 401);
    const created = restorationPlanService.create(req.user, req.body ?? {});
    res.status(201).json(created);
  }),

  revise: asyncHandler((req: Request, res: Response) => {
    res.json(restorationPlanService.reviseContent(req.user!, Number(req.params.id), req.body ?? {}));
  }),

  submit: asyncHandler((req: Request, res: Response) => {
    res.json(restorationPlanService.submit(req.user!, Number(req.params.id), readComment(req)));
  }),

  approve: asyncHandler((req: Request, res: Response) => {
    res.json(restorationPlanService.approve(req.user!, Number(req.params.id), readComment(req)));
  }),

  reject: asyncHandler((req: Request, res: Response) => {
    const reason = (req.body ?? {}).reason ?? (req.body ?? {}).comment;
    // 退回原因必填的错误在 service 中以 PLAN_REJECTION_REASON_REQUIRED 抛出
    res.json(restorationPlanService.reject(req.user!, Number(req.params.id), typeof reason === "string" ? reason : ""));
  }),

  archive: asyncHandler((req: Request, res: Response) => {
    res.json(restorationPlanService.archive(req.user!, Number(req.params.id), readComment(req)));
  })
};
