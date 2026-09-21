import User from "../models/User.js";
import Certificate from "../models/Certificate.js";
import TrainingResult from "../models/TrainingResult.js";
import TrainingModule from "../models/TrainingModule.js";

// @desc    Get dashboard metrics for React admin dashboard
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalWorkers = await User.countDocuments({ role: "worker" });
    const totalSimulations = await TrainingResult.countDocuments();
    const totalCertificates = await Certificate.countDocuments({ status: "valid" });

    // Industry breakdown of workers
    const industryStats = await User.aggregate([
      { $match: { role: "worker" } },
      { $group: { _id: "$industry", count: { $sum: 1 } } }
    ]);

    // Space Hazard module statistics
    const spaceCertificates = await Certificate.find({ moduleId: "SPACE_HAZARD" });
    const spaceScores = spaceCertificates.map((c) => c.scorePercentage);
    const averageScore = spaceScores.length > 0
      ? Math.round(spaceScores.reduce((a, b) => a + b, 0) / spaceScores.length)
      : 0;

    // Recent 5 certificates
    const recentCertificates = await Certificate.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("certificateId workerName moduleTitle industry scorePercentage issueDate status");

    // Recent 5 AR simulations
    const recentSimulations = await TrainingResult.find()
      .populate("userId", "name email industry")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalWorkers,
          totalSimulations,
          totalCertificates,
          activeModule: "SPACE_HAZARD"
        },
        moduleMetrics: {
          moduleId: "SPACE_HAZARD",
          title: "Confined Space & Space Hazard Safety",
          totalCertifiedWorkers: spaceCertificates.length,
          averagePassingScore: averageScore
        },
        industryBreakdown: industryStats.reduce((acc, curr) => {
          acc[curr._id || "other"] = curr.count;
          return acc;
        }, {}),
        recentCertificates,
        recentSimulations
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard statistics.",
      error: error.message
    });
  }
};

// @desc    Get all registered workers
// @route   GET /api/v1/admin/workers
// @access  Private/Admin
export const getAllWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: "worker" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: workers.length,
      data: workers
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workers list.",
      error: error.message
    });
  }
};

// @desc    Get all issued certificates with optional filters
// @route   GET /api/v1/admin/certificates
// @access  Private/Admin
export const getAllCertificates = async (req, res) => {
  try {
    const { status, moduleId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (moduleId) filter.moduleId = moduleId.toUpperCase().trim();

    const certificates = await Certificate.find(filter)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates.",
      error: error.message
    });
  }
};

// @desc    Update certificate status (e.g. revoke or reinstate)
// @route   PATCH /api/v1/admin/certificates/:certificateId/status
// @access  Private/Admin
export const updateCertificateStatus = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { status } = req.body;

    if (!["valid", "revoked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'valid' or 'revoked'."
      });
    }

    const cert = await Certificate.findOneAndUpdate(
      { certificateId: certificateId.toUpperCase().trim() },
      { status },
      { new: true }
    );

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: `Certificate status updated to '${status}'.`,
      data: cert.toPublicJSON()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update certificate status.",
      error: error.message
    });
  }
};
