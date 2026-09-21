import mongoose from "mongoose";

const syncRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    clientSyncId: {
      type: String,
      required: true,
      unique: true // Idempotency protection against retried syncs
    },
    actionType: {
      type: String,
      enum: ["SIMULATION_RESULT", "ASSESSMENT_SUBMIT", "PROGRESS_UPDATE"],
      required: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    syncedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "IGNORED_DUPLICATE"],
      default: "SUCCESS"
    }
  },
  {
    timestamps: true
  }
);

const SyncRecord = mongoose.model("SyncRecord", syncRecordSchema);

export default SyncRecord;
