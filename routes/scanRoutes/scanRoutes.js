const express = require("express");
const router = express.Router();

const { getScanHistory } = require("../../controllers/scanController/scanController");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");

router.get("/:petId", protect, getScanHistory);

module.exports = router;