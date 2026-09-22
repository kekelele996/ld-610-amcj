import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { ErrorCode } from "../constants/errorCodes";
import { renderTemplate } from "./formatters";

/** 带错误码的业务异常，service/controller 分别包装后交给 errorHandlerMiddleware */
export class BusinessError extends Error {
  readonly status: number;
  readonly code: ErrorCode;

  constructor(code: ErrorCode, params: Record<string, string | number> = {}, status = 400) {
    super(renderTemplate(ERROR_MESSAGES[code], params));
    this.name = "BusinessError";
    this.code = code;
    this.status = status;
  }
}
