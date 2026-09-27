const express = require("express");
const router = express.Router();

const { login, logout, getMe } = require("../../controllers/loginController/loginController");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");

router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

module.exports = router;