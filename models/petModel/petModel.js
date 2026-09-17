const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    petId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Pet name is required"],
      trim: true,
      maxlength: [40, "Pet name cannot exceed 40 characters"],
    },
    species: {
      type: String,
      required: [true, "Species is required (e.g. Dog, Cat)"],
      trim: true,
    },
    breed: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
    },
    gender: {
      type: String,
      enum: ["male", "female", "unknown"],
      default: "unknown",
    },
    color: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    qrCodeUrl: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    isLost: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);