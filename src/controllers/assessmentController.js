import Assessment from "../models/Assessment.js";
import TrainingModule from "../models/TrainingModule.js";
import Certificate from "../models/Certificate.js";
import { generateCertificateId } from "../utils/certificateGenerator.js";
import { generateQRCodeDataUrl } from "../utils/qrCodeGenerator.js";

// @desc    Get assessment questions for a module
// @route   GET /api/v1/assessments/module/:moduleId
// @access  Authenticated
export const getAssessmentByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { lang } = req.query; // optional language filter: en, hi, sat

    const assessment = await Assessment.findOne({
      moduleId: moduleId.toUpperCase().trim(),
      isActive: true
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: `Assessment not found for module '${moduleId}'.`
      });
    }

    // Format questions based on requested language if specified
    const questionsFormatted = assessment.questions.map((q) => {
      const questionText =
        lang && q.questionText[lang]
          ? q.questionText[lang]
          : q.questionText;

      const options = q.options.map((opt) => ({
        optionId: opt.optionId,
        text: lang && opt.text[lang] ? opt.text[lang] : opt.text
      }));

      return {
        questionId: q.questionId,
        questionText,
        options,
        points: q.points
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        moduleId: assessment.moduleId,
        title: assessment.title,
        passingScorePercentage: assessment.passingScorePercentage,
        totalPoints: assessment.totalPoints,
        questionsCount: questionsFormatted.length,
        questions: questionsFormatted
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve assessment.",
      error: error.message
    });
  }
};

// @desc    Submit assessment answers & calculate score & issue certificate if passed
// @route   POST /api/v1/assessments/submit
// @access  Authenticated (Worker)
export const submitAssessment = async (req, res) => {
  try {
    const { moduleId, answers } = req.body;

    if (!moduleId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ModuleId and answers array are required."
      });
    }

    // Explicitly query assessment with correct answers included
    const assessment = await Assessment.findOne({
      moduleId: moduleId.toUpperCase().trim()
    }).select("+questions.correctOptionId");

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: `Assessment not found for module '${moduleId}'.`
      });
    }

    // Calculate score
    let earnedPoints = 0;
    const answerBreakdown = [];

    assessment.questions.forEach((q) => {
      const submitted = answers.find((a) => a.questionId === q.questionId);
      const isCorrect =
        submitted &&
        submitted.selectedOptionId &&
        submitted.selectedOptionId.toUpperCase() === q.correctOptionId.toUpperCase();

      if (isCorrect) {
        earnedPoints += q.points;
      }

      answerBreakdown.push({
        questionId: q.questionId,
        selectedOptionId: submitted ? submitted.selectedOptionId : null,
        correct: Boolean(isCorrect),
        explanation: q.explanation
      });
    });

    const scorePercentage = Math.round((earnedPoints / assessment.totalPoints) * 100);
    const passed = scorePercentage >= assessment.passingScorePercentage;

    let certificate = null;

    // If passed, issue digital certificate
    if (passed) {
      // Check if user already holds a valid certificate for this module
      let existingCert = await Certificate.findOne({
        userId: req.user._id,
        moduleId: assessment.moduleId,
        status: "valid"
      });

      if (!existingCert) {
        // Fetch module title
        const trainingModule = await TrainingModule.findOne({ moduleId: assessment.moduleId });
        const moduleTitle = trainingModule ? trainingModule.title : assessment.title;

        // Generate unique certificate ID (e.g. SURAKSHA-SPACE-2026-0001)
        const certificateId = await generateCertificateId("SPACE");
        const verificationPath = `/verify/${certificateId}`;
        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
        const qrPayload = `${clientUrl}${verificationPath}`;
        const qrCodeDataUrl = await generateQRCodeDataUrl(qrPayload);

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

    return res.status(200).json({
      success: true,
      message: passed
        ? "Congratulations! You passed the assessment and earned your certificate."
        : "Assessment not passed. You can review the training module and retry.",
      data: {
        moduleId: assessment.moduleId,
        scorePercentage,
        passingScorePercentage: assessment.passingScorePercentage,
        passed,
        earnedPoints,
        totalPoints: assessment.totalPoints,
        certificate,
        answerBreakdown
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process assessment submission.",
      error: error.message
    });
  }
};
