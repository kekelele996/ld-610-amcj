import { ERROR_CODES } from "../constants/errorCodes";
import type { ErrorCode } from "../constants/errorCodes";

// 业务异常：携带 HTTP 状态、错误码与可读失败原因
export class BusinessError extends Error {
  status: number;
  code: ErrorCode;

  constructor(code: ErrorCode, message: string, status = 400) {
    super(message);
    this.name = "BusinessError";
    this.code = code;
    this.status = status;
  }
}

export const validationError = (message: string) =>
  new BusinessError(ERROR_CODES.VALIDATION_FAILED, message, 400);

export const notFoundError = (code: ErrorCode, message: string) =>
  new BusinessError(code, message, 404);

export const forbiddenError = (code: ErrorCode, message: string) =>
  new BusinessError(code, message, 403);

export const conflictError = (code: ErrorCode, message: string) =>
  new BusinessError(code, message, 409);
