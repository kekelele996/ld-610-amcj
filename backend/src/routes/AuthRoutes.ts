import { Router } from "express";
import { authController } from "../controllers/AuthController";

const router = Router();

router.post("/login", authController.login);
router.get("/accounts", authController.accounts);

export default router;
