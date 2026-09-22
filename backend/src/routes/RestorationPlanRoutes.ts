import { Router } from "express";
import { restorationPlanController } from "../controllers/RestorationPlanController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", restorationPlanController.list);
router.get("/:id", restorationPlanController.detail);
// 编制方案：修复师
router.post("/", rbacMiddleware(["RESTORER"]), restorationPlanController.create);
// 审批链：送审（修复师）/通过、退回（专家）/归档（档案员），动作与状态由 service 二次校验
router.post("/:id/approval", rbacMiddleware(["RESTORER", "EXPERT", "ARCHIVIST"]), restorationPlanController.approve);

export default router;
