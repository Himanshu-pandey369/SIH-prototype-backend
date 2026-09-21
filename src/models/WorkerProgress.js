import mongoose from "mongoose";

const workerProgressSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: [
        "NOT_STARTED",
        "IN_PROGRESS",
        "SIMULATION_COMPLETED",
        "ASSESSMENT_COMPLETED",
        "CERTIFIED"
      ],
      default: "NOT_STARTED"
    },
    currentStep: {
      type: Number,
      default: 0
    },
    totalSteps: {
      type: Number,
      default: 5
    },
    completedSteps: {
      type: [String],
      default: []
    },
    hazardsIdentified: {
      type: [String],
      default: []
    },
    percentageProgress: {
      type: Number,
      default: 0
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure 1 progress record per worker per module
workerProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

const WorkerProgress = mongoose.model("WorkerProgress", workerProgressSchema);

export default WorkerProgress;
