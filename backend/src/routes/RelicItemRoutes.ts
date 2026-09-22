import { Router } from "express";
import { relicItemController } from "../controllers/RelicItemController";

const router = Router();

// 只读档案接口；所有登录角色（含访客）均可查看，写操作不在本路由开放
router.get("/", relicItemController.list);
router.get("/archives", relicItemController.archives);
router.get("/:id/archive", relicItemController.archive);

export default router;
