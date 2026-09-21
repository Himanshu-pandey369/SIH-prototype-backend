import express from "express";
import {
  getAllModules,
  getModuleByCode,
  createModule
} from "../controllers/moduleController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllModules);
router.get("/:code", getModuleByCode);
router.post("/", authenticate, requireAdmin, createModule);

export default router;
