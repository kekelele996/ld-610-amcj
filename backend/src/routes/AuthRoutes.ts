import { Router } from "express";
import { authController } from "../controllers/AuthController";

const router = Router();

// 登录为公开端点，具体放行由 authMiddleware 的 PUBLIC_PATHS 控制
router.post("/login", authController.login);

export default router;
