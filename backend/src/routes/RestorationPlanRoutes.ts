import { Router } from "express";
import { restorationPlanController } from "../controllers/RestorationPlanController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";
import type { Role } from "../constants/Role";

const RESTORER: Role[] = ["RESTORER"];
const EXPERT: Role[] = ["EXPERT"];
const ARCHIVIST: Role[] = ["ARCHIVIST"];
const ALL_ROLES: Role[] = ["RESTORER", "EXPERT", "ARCHIVIST", "VISITOR"];

const router = Router();

// 审批链与步骤进度对所有登录角色可见（访客只读）
router.get("/", rbacMiddleware(ALL_ROLES, "list plans"), restorationPlanController.list);
router.get("/:id", rbacMiddleware(ALL_ROLES, "view plan"), restorationPlanController.detail);

// 修复师：编制与送审。专家/档案员越权调用将得到 RBAC_DENIED 明确失败原因
router.post("/", rbacMiddleware(RESTORER, "create plan"), restorationPlanController.create);
router.patch("/:id", rbacMiddleware(RESTORER, "revise plan"), restorationPlanController.revise);
router.post("/:id/submit", rbacMiddleware(RESTORER, "submit plan"), restorationPlanController.submit);

// 专家审批：通过 / 退回（退回原因必填，见 service）
router.post("/:id/approve", rbacMiddleware(EXPERT, "approve plan"), restorationPlanController.approve);
router.post("/:id/reject", rbacMiddleware(EXPERT, "reject plan"), restorationPlanController.reject);

// 档案员归档（修复师/专家越权调用将得到 RBAC_DENIED）
router.post("/:id/archive", rbacMiddleware(ARCHIVIST, "archive plan"), restorationPlanController.archive);

export default router;
