import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: [true, "Certificate ID is required"],
      unique: true,
      uppercase: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    workerName: {
      type: String,
      required: true
    },
    moduleId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    moduleTitle: {
      type: String,
      required: true
    },
    industry: {
      type: String,
      default: "mining"
    },
    scorePercentage: {
      type: Number,
      required: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["valid", "revoked"],
      default: "valid"
    },
    verificationPath: {
      type: String,
      required: true
    },
    qrCodeDataUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Method to format sanitized public data for QR verification
certificateSchema.methods.toPublicJSON = function () {
  return {
    certificateId: this.certificateId,
    workerName: this.workerName,
    moduleTitle: this.moduleTitle,
    moduleId: this.moduleId,
    industry: this.industry,
    scorePercentage: this.scorePercentage,
    issueDate: this.issueDate,
    status: this.status,
    verificationPath: this.verificationPath,
    qrCodeDataUrl: this.qrCodeDataUrl
  };
};

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
