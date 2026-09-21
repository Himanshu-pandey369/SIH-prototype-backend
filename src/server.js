import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedDefaultData } from "./utils/seeder.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDefaultData();

  app.listen(PORT, () => {
    console.log(`[AI Safe Server] Server running on http://localhost:${PORT}`);
    console.log(`[AI Safe Server] Health check available at http://localhost:${PORT}/api/v1/health`);
  });
};

startServer();
