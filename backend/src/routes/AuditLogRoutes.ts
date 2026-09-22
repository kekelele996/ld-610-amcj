import { Router } from "express";
import { auditLogController } from "../controllers/AuditLogController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

// 审计链追溯：专家与档案员可查看完整审批/执行日志
router.get("/", rbacMiddleware(["EXPERT", "ARCHIVIST", "RESTORER"]), auditLogController.list);

export default router;
