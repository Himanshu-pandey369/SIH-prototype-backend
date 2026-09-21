import SyncRecord from "../models/SyncRecord.js";
import TrainingResult from "../models/TrainingResult.js";
import WorkerProgress from "../models/WorkerProgress.js";
import Assessment from "../models/Assessment.js";
import TrainingModule from "../models/TrainingModule.js";
import Certificate from "../models/Certificate.js";
import { generateCertificateId } from "../utils/certificateGenerator.js";
import { generateQRCodeDataUrl } from "../utils/qrCodeGenerator.js";

// @desc    Synchronize offline Android training and assessment actions
// @route   POST /api/v1/sync/batch
// @access  Authenticated (Worker)
export const batchSync = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "An array of sync items is required."
      });
    }

    const syncResults = [];
    let processedCount = 0;
    let ignoredDuplicates = 0;

    for (const item of items) {
      const { clientSyncId, actionType, payload } = item;

      if (!clientSyncId || !actionType || !payload) {
        syncResults.push({
          clientSyncId,
          status: "FAILED",
          message: "clientSyncId, actionType, and payload are required."
        });
        continue;
      }

      // Check if already processed (Idempotency)
      const existingSync = await SyncRecord.findOne({ clientSyncId });
      if (existingSync) {
        ignoredDuplicates++;
        syncResults.push({
          clientSyncId,
          status: "IGNORED_DUPLICATE",
          message: "Already synchronized."
        });
        continue;
      }

      let actionResult = null;

      if (actionType === "SIMULATION_RESULT") {
        actionResult = await TrainingResult.create({
          userId: req.user._id,
          moduleId: (payload.moduleId || "SPACE_HAZARD").toUpperCase().trim(),
          hazardsIdentified: payload.hazardsIdentified || 0,
          totalHazards: payload.totalHazards || 5,
          timeTakenSeconds: payload.timeTakenSeconds || 0,
          safetyViolations: payload.safetyViolations || [],
          notes: payload.notes || "Synced from offline session"
        });
      } else if (actionType === "PROGRESS_UPDATE") {
        let progress = await WorkerProgress.findOne({
          userId: req.user._id,
          moduleId: (payload.moduleId || "SPACE_HAZARD").toUpperCase().trim()
        });

        if (!progress) {
          progress = new WorkerProgress({
            userId: req.user._id,
            moduleId: (payload.moduleId || "SPACE_HAZARD").toUpperCase().trim()
          });
        }

        if (payload.stepKey && !progress.completedSteps.includes(payload.stepKey)) {
          progress.completedSteps.push(payload.stepKey);
        }
        if (payload.hazardKey && !progress.hazardsIdentified.includes(payload.hazardKey)) {
          progress.hazardsIdentified.push(payload.hazardKey);
        }

        progress.currentStep = progress.completedSteps.length;
        progress.percentageProgress = Math.min(
          100,
          Math.round((progress.completedSteps.length / progress.totalSteps) * 100)
        );
        if (payload.status) progress.status = payload.status;
        progress.lastActiveAt = new Date();
        await progress.save();
        actionResult = progress;
      } else if (actionType === "ASSESSMENT_SUBMIT") {
        const assessment = await Assessment.findOne({
          moduleId: (payload.moduleId || "SPACE_HAZARD").toUpperCase().trim()
        }).select("+questions.correctOptionId");

        if (assessment && Array.isArray(payload.answers)) {
          let earnedPoints = 0;
          assessment.questions.forEach((q) => {
            const submitted = payload.answers.find((a) => a.questionId === q.questionId);
            if (
              submitted &&
              submitted.selectedOptionId &&
              submitted.selectedOptionId.toUpperCase() === q.correctOptionId.toUpperCase()
            ) {
              earnedPoints += q.points;
            }
          });

          const scorePercentage = Math.round((earnedPoints / assessment.totalPoints) * 100);
          const passed = scorePercentage >= assessment.passingScorePercentage;
          let certificate = null;

          if (passed) {
            let existingCert = await Certificate.findOne({
              userId: req.user._id,
              moduleId: assessment.moduleId,
              status: "valid"
            });

            if (!existingCert) {
              const trainingModule = await TrainingModule.findOne({ moduleId: assessment.moduleId });
              const moduleTitle = trainingModule ? trainingModule.title : assessment.title;
              const certificateId = await generateCertificateId("SPACE");
              const verificationPath = `/verify/${certificateId}`;
              const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
              const qrCodeDataUrl = await generateQRCodeDataUrl(`${clientUrl}${verificationPath}`);

              existingCert = await Certificate.create({
                certificateId,
                userId: req.user._id,
                workerName: req.user.name,
                moduleId: assessment.moduleId,
                moduleTitle,
                industry: req.user.industry || "mining",
                scorePercentage,
                verificationPath,
                qrCodeDataUrl: qrCodeDataUrl || "",
                status: "valid"
              });
            }
            certificate = existingCert.toPublicJSON();
          }

          actionResult = { scorePercentage, passed, certificate };
        }
      }

      // Record successful sync
      await SyncRecord.create({
        userId: req.user._id,
        clientSyncId,
        actionType,
        payload,
        status: "SUCCESS"
      });

      processedCount++;
      syncResults.push({
        clientSyncId,
        status: "SUCCESS",
        actionResult
      });
    }

    return res.status(200).json({
      success: true,
      message: "Batch synchronization completed",
      data: {
        totalItems: items.length,
        processedCount,
        ignoredDuplicates,
        results: syncResults
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Sync failed due to server error.",
      error: error.message
    });
  }
};

// @desc    Get user's sync history
// @route   GET /api/v1/sync/history
// @access  Authenticated
export const getSyncHistory = async (req, res) => {
  try {
    const history = await SyncRecord.find({ userId: req.user._id })
      .sort({ syncedAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sync history.",
      error: error.message
    });
  }
};
