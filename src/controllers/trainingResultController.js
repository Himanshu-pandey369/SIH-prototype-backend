import TrainingResult from "../models/TrainingResult.js";

// @desc    Submit AR simulation training result
// @route   POST /api/v1/training-results
// @access  Authenticated (Worker)
export const submitTrainingResult = async (req, res) => {
  try {
    const { moduleId, hazardsIdentified, totalHazards, timeTakenSeconds, safetyViolations, notes } = req.body;

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: "Module ID is required."
      });
    }

    const trainingResult = await TrainingResult.create({
      userId: req.user._id,
      moduleId: moduleId.toUpperCase().trim(),
      hazardsIdentified: hazardsIdentified !== undefined ? hazardsIdentified : 0,
      totalHazards: totalHazards !== undefined ? totalHazards : 5,
      timeTakenSeconds: timeTakenSeconds || 0,
      safetyViolations: safetyViolations || [],
      completed: true,
      notes: notes || ""
    });

    return res.status(201).json({
      success: true,
      message: "AR training simulation result recorded successfully",
      data: trainingResult
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to record training result.",
      error: error.message
    });
  }
};

// @desc    Get user's training history
// @route   GET /api/v1/training-results/my-results
// @access  Authenticated
export const getMyTrainingResults = async (req, res) => {
  try {
    const results = await TrainingResult.find({ userId: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve training results.",
      error: error.message
    });
  }
};
