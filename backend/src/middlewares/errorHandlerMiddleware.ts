import type { ErrorRequestHandler } from "express";

// 全局错误处理：禁止吞掉异常，统一输出 code + 明确失败原因
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = Number(err?.status) || 500;
  if (status >= 500) {
    console.error("[errorHandler]", err);
    return res.status(500).json({ code: "INTERNAL_ERROR", message: "服务内部错误", status: 500 });
  }
  res.status(status).json({ code: String(err?.code ?? "BUSINESS_ERROR"), message: String(err?.message ?? "请求失败"), status });
};
