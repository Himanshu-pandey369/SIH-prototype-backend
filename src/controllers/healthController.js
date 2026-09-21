import mongoose from "mongoose";

export const getHealthStatus = async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    };

    return res.status(200).json({
      success: true,
      message: "AI Safe backend service is operational",
      timestamp: new Date().toISOString(),
      database: dbStatusMap[dbState] || "unknown"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message
    });
  }
};
