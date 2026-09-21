import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import trainingResultRoutes from "./routes/trainingResultRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import syncRoutes from "./routes/syncRoutes.js";

const app = express();

// Allowed origins configuration
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, or server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, "");

      // Check if origin is explicitly in allowedOrigins or matches vercel.app domains
      const isAllowed =
        allowedOrigins.includes(normalizedOrigin) ||
        /\.vercel\.app$/.test(new URL(origin).hostname) ||
        /^http:\/\/localhost(:\d+)?$/.test(normalizedOrigin);

      if (isAllowed) {
        return callback(null, true);
      } else {
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base Route
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "AI Safe Backend API is running",
    version: "v1"
  });
});

// Mount versioned API routes
app.use("/api/v1", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/modules", moduleRoutes);
app.use("/api/v1/assessments", assessmentRoutes);
app.use("/api/v1/training-results", trainingResultRoutes);
app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/sync", syncRoutes);

// Fallback 404 handler (Controller-style direct response, no global errorMiddleware)
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

export default app;
