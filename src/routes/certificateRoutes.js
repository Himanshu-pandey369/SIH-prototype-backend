import express from "express";
import {
  verifyCertificate,
  getMyCertificates,
  getCertificateById
} from "../controllers/certificateController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route: QR code verification (No authentication required)
router.get("/verify/:certificateId", verifyCertificate);

// Protected routes
router.get("/my-certificates", authenticate, getMyCertificates);
router.get("/:certificateId", authenticate, getCertificateById);

export default router;
