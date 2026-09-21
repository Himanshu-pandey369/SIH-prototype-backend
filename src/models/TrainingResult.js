import mongoose from "mongoose";

const trainingResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"]
    },
    moduleId: {
      type: String,
      required: [true, "Module ID is required"],
      uppercase: true,
      trim: true
    },
    hazardsIdentified: {
      type: Number,
      default: 0,
      min: 0
    },
    totalHazards: {
      type: Number,
      default: 5,
      min: 1
    },
    timeTakenSeconds: {
      type: Number,
      default: 0
    },
    safetyViolations: {
      type: [String],
      default: []
    },
    completed: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const TrainingResult = mongoose.model("TrainingResult", trainingResultSchema);

export default TrainingResult;
