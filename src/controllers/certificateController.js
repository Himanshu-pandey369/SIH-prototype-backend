import Certificate from "../models/Certificate.js";

// @desc    Public certificate verification endpoint (Used by QR code scanners & verification website)
// @route   GET /api/v1/certificates/verify/:certificateId
// @access  Public (NO AUTHENTICATION REQUIRED)
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        message: "Certificate ID parameter is required."
      });
    }

    const cert = await Certificate.findOne({
      certificateId: certificateId.toUpperCase().trim()
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: `Certificate with ID '${certificateId}' was not found or is invalid.`
      });
    }

    // Expose only sanitized verification details - NO private or sensitive information
    return res.status(200).json({
      success: true,
      message: "Certificate verified successfully",
      data: cert.toPublicJSON()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while verifying certificate.",
      error: error.message
    });
  }
};

// @desc    Get all certificates earned by currently authenticated worker
// @route   GET /api/v1/certificates/my-certificates
// @access  Authenticated (Worker)
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.user._id }).sort({ issueDate: -1 });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates.map((c) => c.toPublicJSON())
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user certificates.",
      error: error.message
    });
  }
};

// @desc    Get detailed certificate by ID (Authenticated user or admin)
// @route   GET /api/v1/certificates/:certificateId
// @access  Authenticated
export const getCertificateById = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({
      certificateId: certificateId.toUpperCase().trim()
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found."
      });
    }

    // Workers can only view their own certificate; Admin can view any
    if (req.user.role !== "admin" && cert.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not own this certificate."
      });
    }

    return res.status(200).json({
      success: true,
      data: cert.toPublicJSON()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificate.",
      error: error.message
    });
  }
};
