import type { NextFunction, Request, RequestHandler, Response } from "express";

/** controller 包装器：异步异常交给 errorHandlerMiddleware，禁止吞掉 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
