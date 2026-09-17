const mongoose = require("mongoose");

const scanHistorySchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    location: {
      type: String, // optional free-text location if the scanner's device/browser provides it
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScanHistory", scanHistorySchema);