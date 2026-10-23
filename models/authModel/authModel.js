const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Password-reset OTP (stored hashed, never in plain text)
    otp: {
      type: String,
      select: false,
    },
    otpExpire: Date,
    otpAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Async pre-save hook — no `next` parameter needed; Mongoose awaits the promise.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Create a 6-digit OTP, store only its hash + a 10 minute expiry, return the plain OTP
// so it can be emailed. The caller must save the document.
userSchema.methods.generateOtp = function () {
  const otp = crypto.randomInt(100000, 1000000).toString();

  this.otp = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.otpAttempts = 0;

  return otp;
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);