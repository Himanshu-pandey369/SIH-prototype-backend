import express from "express";
import {
  getAssessmentByModule,
  submitAssessment
} from "../controllers/assessmentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/module/:moduleId", authenticate, getAssessmentByModule);
router.post("/submit", authenticate, submitAssessment);

export default router;
