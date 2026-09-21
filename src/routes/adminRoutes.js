import express from "express";
import {
  getAdminDashboardStats,
  getAllWorkers,
  getAllCertificates,
  updateCertificateStatus
} from "../controllers/adminController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes all require authentication and admin role
router.use(authenticate, requireAdmin);

router.get("/dashboard", getAdminDashboardStats);
router.get("/workers", getAllWorkers);
router.get("/certificates", getAllCertificates);
router.patch("/certificates/:certificateId/status", updateCertificateStatus);

export default router;
