import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    optionId: {
      type: String,
      required: true
    },
    text: {
      en: { type: String, required: true },
      hi: { type: String, default: "" },
      sat: { type: String, default: "" }
    }
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true
    },
    questionText: {
      en: { type: String, required: true },
      hi: { type: String, default: "" },
      sat: { type: String, default: "" }
    },
    options: [optionSchema],
    correctOptionId: {
      type: String,
      required: true,
      select: false // Hide correct answer from standard API responses
    },
    explanation: {
      type: String,
      default: ""
    },
    points: {
      type: Number,
      default: 20
    }
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: [true, "Module ID is required"],
      unique: true,
      uppercase: true,
      trim: true
    },
    title: {
      type: String,
      required: true
    },
    passingScorePercentage: {
      type: Number,
      default: 75,
      min: 0,
      max: 100
    },
    totalPoints: {
      type: Number,
      default: 100
    },
    questions: [questionSchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;
