import express from "express";
import { batchSync, getSyncHistory } from "../controllers/syncController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/batch", authenticate, batchSync);
router.get("/history", authenticate, getSyncHistory);

export default router;
