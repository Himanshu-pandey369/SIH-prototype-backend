import express from "express";
import {
  getModuleProgress,
  updateStepProgress
} from "../controllers/progressController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:moduleId", authenticate, getModuleProgress);
router.post("/step", authenticate, updateStepProgress);

export default router;
