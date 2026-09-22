import { Router } from "express";
import { imageVersionController } from "../controllers/ImageVersionController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";
import type { Role } from "../constants/Role";

const ALL_ROLES: Role[] = ["RESTORER", "EXPERT", "ARCHIVIST", "VISITOR"];

const router = Router();
router.get("/", rbacMiddleware(ALL_ROLES, "list images"), imageVersionController.list);
// 影像归档由档案员执行，修复师可上传过程影像
router.post(
  "/",
  rbacMiddleware(["ARCHIVIST", "RESTORER"] as Role[], "archive image version"),
  imageVersionController.create
);

export default router;
