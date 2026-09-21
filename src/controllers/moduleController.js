import TrainingModule from "../models/TrainingModule.js";

// @desc    Get all training modules
// @route   GET /api/v1/modules
// @access  Public / Authenticated
export const getAllModules = async (req, res) => {
  try {
    const modules = await TrainingModule.find({ isActive: true }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: modules.length,
      data: modules
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch training modules.",
      error: error.message
    });
  }
};

// @desc    Get single module by code/moduleId
// @route   GET /api/v1/modules/:code
// @access  Public / Authenticated
export const getModuleByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const trainingModule = await TrainingModule.findOne({
      moduleId: code.toUpperCase().trim()
    });

    if (!trainingModule) {
      return res.status(404).json({
        success: false,
        message: `Module with identifier '${code}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: trainingModule
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch module details.",
      error: error.message
    });
  }
};

// @desc    Create a new module (Admin only)
// @route   POST /api/v1/modules
// @access  Private/Admin
export const createModule = async (req, res) => {
  try {
    const { moduleId, title, description, industryTypes, passingScorePercentage, arScenarioConfig } = req.body;

    if (!moduleId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "moduleId, title, and description are required."
      });
    }

    const existingModule = await TrainingModule.findOne({
      moduleId: moduleId.toUpperCase().trim()
    });

    if (existingModule) {
      return res.status(409).json({
        success: false,
        message: `Module '${moduleId}' already exists.`
      });
    }

    const newModule = await TrainingModule.create({
      moduleId: moduleId.toUpperCase().trim(),
      title,
      description,
      industryTypes: industryTypes || ["mining", "steel", "mica"],
      passingScorePercentage: passingScorePercentage !== undefined ? passingScorePercentage : 70,
      arScenarioConfig: arScenarioConfig || {}
    });

    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: newModule
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create module.",
      error: error.message
    });
  }
};
