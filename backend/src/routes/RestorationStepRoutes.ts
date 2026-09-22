import { Router } from "express";
import { restorationStepController } from "../controllers/RestorationStepController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";
import type { Role } from "../constants/Role";

const RESTORER: Role[] = ["RESTORER"];
const ALL_ROLES: Role[] = ["RESTORER", "EXPERT", "ARCHIVIST", "VISITOR"];

const router = Router();

router.get("/", rbacMiddleware(ALL_ROLES, "list steps"), restorationStepController.list);

// 步骤登记与执行仅修复师可操作；未通过审批的方案在 service 层被明确拦截
router.post("/", rbacMiddleware(RESTORER, "register step"), restorationStepController.register);
router.post("/:id/start", rbacMiddleware(RESTORER, "start step"), restorationStepController.start);
router.post("/:id/complete", rbacMiddleware(RESTORER, "complete step"), restorationStepController.complete);

export default router;
