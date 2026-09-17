const ScanHistory = require("../../models/scanHistoryModel/scanHistoryModel");
const Pet = require("../../models/petModel/petModel");

/**
 * Internal helper (not a route handler) - records a QR scan event for a pet.
 * Called from petController.getPublicPetProfile whenever a public profile is viewed.
 * Failures here are logged but never block the pet-profile response.
 * @param {string} petObjectId - Mongo _id of the pet that was scanned
 * @param {import('express').Request} req
 */
const recordScan = async (petObjectId, req) => {
  try {
    await ScanHistory.create({
      pet: petObjectId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Failed to record scan:", error.message);
  }
};

/**
 * @desc    Get scan history for a pet (owner only)
 * @route   GET /api/scan/:petId
 * @access  Private (pet owner only)
 */
const getScanHistory = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.petId,
      owner: req.user.id,
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    const scans = await ScanHistory.find({ pet: pet._id }).sort({
      scannedAt: -1,
    });

    res.status(200).json({ success: true, count: scans.length, scans });
  } catch (error) {
    next(error);
  }
};

module.exports = { recordScan, getScanHistory };