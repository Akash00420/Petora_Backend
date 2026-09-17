const express = require("express");
const router = express.Router();

const {
  markPetLost,
  resolveLostReport,
  getLostReports,
  getMyLostReports,
} = require("../../controllers/lostController/lostController");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");

router.get("/", getLostReports); // public community feed
router.get("/my", protect, getMyLostReports);
router.post("/:petId", protect, markPetLost);
router.put("/:id/resolve", protect, resolveLostReport);

module.exports = router;