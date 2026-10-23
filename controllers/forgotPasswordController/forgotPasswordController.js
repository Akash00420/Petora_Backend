const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../../models/authModel/authModel");
const sendEmail = require("../../utils/mailer");
const { SECRET_KEY } = require("../../utils/config");

const MAX_OTP_ATTEMPTS = 5;

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");

const clearOtp = (user) => {
  user.otp = undefined;
  user.otpExpire = undefined;
  user.otpAttempts = 0;
};

/**
 * @desc    Email a 6-digit OTP for resetting the password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Same answer whether or not the email exists, so accounts can't be probed
    const genericMessage = "If that email is registered, an OTP has been sent to it";

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const otp = user.generateOtp();
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        to: user.email,
        subject: "Your Petora password reset OTP",
        text: `Your Petora password reset OTP is ${otp}. It is valid for 10 minutes. If you did not request this, please ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;
                      border: 1px solid #e0e0e0; border-radius: 8px; padding: 32px;">
            <h2 style="color: #14917f; margin-bottom: 8px;">Password reset request</h2>
            <p style="color: #555;">Use this OTP to reset your Petora password. It is valid for <strong>10 minutes</strong>.</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px;
                           color: #111; background: #f3f4f6; padding: 12px 24px;
                           border-radius: 8px; display: inline-block;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 13px;">
              If you did not request this, please ignore this email. Your account is safe.
            </p>
          </div>`,
      });

      return res.status(200).json({ success: true, message: genericMessage });
    } catch (emailError) {
      // Show the real reason in the server terminal (auth failure, etc.)
      console.error("Email send failed:", emailError.message);

      clearOtp(user);
      await user.save({ validateBeforeSave: false });

      // In development, show the real reason on the page to make setup easier
      const isDev = (process.env.NODE_ENV || "development") === "development";

      return res.status(500).json({
        success: false,
        message: isDev
          ? `Email could not be sent: ${emailError.message}`
          : "Email could not be sent, please try again later",
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check the OTP and set a new password. Logs the user in on success.
 * @route   PUT /api/auth/reset-password
 * @body    { email, otp, password }
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+otp");

    if (!user || !user.otp || !user.otpExpire || user.otpExpire.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or has expired. Please request a new one.",
      });
    }

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      clearOtp(user);
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    const submitted = Buffer.from(hashOtp(String(otp).trim()), "hex");
    const stored = Buffer.from(user.otp, "hex");
    const isMatch = submitted.length === stored.length && crypto.timingSafeEqual(submitted, stored);

    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });

      const left = MAX_OTP_ATTEMPTS - user.otpAttempts;
      return res.status(400).json({
        success: false,
        message:
          left > 0
            ? `Incorrect OTP. ${left} attempt(s) left.`
            : "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    user.password = password; // hashed by the pre-save hook
    clearOtp(user);
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { forgotPassword, resetPassword };