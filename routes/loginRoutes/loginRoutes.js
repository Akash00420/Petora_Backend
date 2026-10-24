const express = require("express");
const router = express.Router();

const {
  login,
  logout,
  getMe,
  updateProfilePhoto,
  updateProfile,
  changePassword,
} = require("../../controllers/loginController/loginController");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware/uploadMiddleware");

router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/profile/photo", protect, upload.single("photo"), updateProfilePhoto);
router.put("/change-password", protect, changePassword);

module.exports = router;