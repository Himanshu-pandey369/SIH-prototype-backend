import express from "express";
import {
  submitTrainingResult,
  getMyTrainingResults
} from "../controllers/trainingResultController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, submitTrainingResult);
router.get("/my-results", authenticate, getMyTrainingResults);

export default router;
