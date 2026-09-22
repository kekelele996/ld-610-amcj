import type { ErrorRequestHandler } from "express";
import { BusinessError } from "../utils/BusinessError";
import { ERROR_MESSAGES } from "../constants/errorMessages";

/** 全局错误处理：service/controller 抛出的带码异常在这里成型，绝不返回裸 500 字符串 */
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof BusinessError) {
    return res.status(err.status).json({ code: err.code, message: err.message });
  }
  console.error("unhandled error", err);
  return res.status(500).json({ code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR });
};
