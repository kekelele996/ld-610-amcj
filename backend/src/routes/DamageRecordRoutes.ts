import { Router } from "express";
import { damageRecordController } from "../controllers/DamageRecordController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";
import type { Role } from "../constants/Role";

const ALL_ROLES: Role[] = ["RESTORER", "EXPERT", "ARCHIVIST", "VISITOR"];

const router = Router();
router.get("/", rbacMiddleware(ALL_ROLES, "list damage records"), damageRecordController.list);
// 病害登记属于修复师职责
router.post("/", rbacMiddleware(["RESTORER"], "create damage record"), damageRecordController.create);

export default router;
