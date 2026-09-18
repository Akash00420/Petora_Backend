
const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
} = require("../../controllers/userController/userController");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");
const uploadPetPhoto = require("../../middlewares/uploadMiddleware/uploadMiddleware");

router.get("/me", protect, getProfile);
router.put("/me", protect, uploadPetPhoto.single("avatar"), updateProfile);
router.put("/update-password", protect, updatePassword);
router.delete("/me", protect, deleteAccount);

module.exports = router;