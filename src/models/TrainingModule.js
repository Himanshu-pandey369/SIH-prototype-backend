import mongoose from "mongoose";

const trainingModuleSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: [true, "Module identifier is required"],
      unique: true,
      uppercase: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true
    },
    industryTypes: {
      type: [String],
      default: ["mining", "steel", "mica"]
    },
    passingScorePercentage: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    },
    arScenarioConfig: {
      sceneName: { type: String, default: "" },
      targetHazardsCount: { type: Number, default: 4 },
      timeLimitSeconds: { type: Number, default: 300 }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const TrainingModule = mongoose.model("TrainingModule", trainingModuleSchema);

export default TrainingModule;
