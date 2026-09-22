import { Router } from "express";
import { auditLogController } from "../controllers/AuditLogController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";
import type { Role } from "../constants/Role";

const router = Router();

// 操作日志面向内部角色开放，访客不可查看
router.get(
  "/",
  rbacMiddleware(["RESTORER", "EXPERT", "ARCHIVIST"] as Role[], "view audit logs"),
  auditLogController.list
);

export default router;
