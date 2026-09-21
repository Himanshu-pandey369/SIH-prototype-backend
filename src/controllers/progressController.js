import WorkerProgress from "../models/WorkerProgress.js";

// @desc    Get progress for a specific module
// @route   GET /api/v1/progress/:moduleId
// @access  Authenticated
export const getModuleProgress = async (req, res) => {
  try {
    const { moduleId } = req.params;

    let progress = await WorkerProgress.findOne({
      userId: req.user._id,
      moduleId: moduleId.toUpperCase().trim()
    });

    if (!progress) {
      // Initialize progress if first time
      progress = await WorkerProgress.create({
        userId: req.user._id,
        moduleId: moduleId.toUpperCase().trim(),
        status: "NOT_STARTED",
        currentStep: 0,
        totalSteps: 5,
        completedSteps: [],
        hazardsIdentified: [],
        percentageProgress: 0
      });
    }

    return res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve worker progress.",
      error: error.message
    });
  }
};

// @desc    Update progress step or hazard found
// @route   POST /api/v1/progress/step
// @access  Authenticated
export const updateStepProgress = async (req, res) => {
  try {
    const { moduleId, stepKey, hazardKey, status } = req.body;

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: "Module ID is required."
      });
    }

    let progress = await WorkerProgress.findOne({
      userId: req.user._id,
      moduleId: moduleId.toUpperCase().trim()
    });

    if (!progress) {
      progress = new WorkerProgress({
        userId: req.user._id,
        moduleId: moduleId.toUpperCase().trim()
      });
    }

    if (stepKey && !progress.completedSteps.includes(stepKey)) {
      progress.completedSteps.push(stepKey);
    }

    if (hazardKey && !progress.hazardsIdentified.includes(hazardKey)) {
      progress.hazardsIdentified.push(hazardKey);
    }

    progress.currentStep = progress.completedSteps.length;
    progress.percentageProgress = Math.min(
      100,
      Math.round((progress.completedSteps.length / progress.totalSteps) * 100)
    );

    if (status) {
      progress.status = status;
    } else if (progress.percentageProgress >= 100) {
      progress.status = "SIMULATION_COMPLETED";
    } else if (progress.percentageProgress > 0) {
      progress.status = "IN_PROGRESS";
    }

    progress.lastActiveAt = new Date();
    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      data: progress
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update worker progress.",
      error: error.message
    });
  }
};
