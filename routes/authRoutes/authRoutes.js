const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../../controllers/authController/authController");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

module.exports = router;