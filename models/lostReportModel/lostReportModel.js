const mongoose = require("mongoose");

const lostReportSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
    },
    lastSeenLocation: {
      type: String,
      trim: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LostReport", lostReportSchema);