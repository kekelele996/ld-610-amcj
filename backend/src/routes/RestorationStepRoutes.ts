import { Router } from "express";
import { restorationStepController } from "../controllers/RestorationStepController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

// 步骤进度：档案展示，所有登录角色可查看
router.get("/", restorationStepController.list);
router.get("/plan/:planId/progress", restorationStepController.progress);

// 登记 / 开始 / 完成：仅修复师；方案审批门禁与顺序校验在 service 强制执行
router.post("/", rbacMiddleware(["RESTORER"]), restorationStepController.create);
router.post("/:id/start", rbacMiddleware(["RESTORER"]), restorationStepController.start);
router.post("/:id/finish", rbacMiddleware(["RESTORER"]), restorationStepController.finish);

export default router;
