const express = require("express");
const router = express.Router();

const { login, logout, getMe, updateProfilePhoto } = require("../../controllers/loginController/loginController");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware/uploadMiddleware");

router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile/photo", protect, upload.single("photo"), updateProfilePhoto);

module.exports = router;