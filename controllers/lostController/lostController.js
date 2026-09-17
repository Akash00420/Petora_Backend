const Pet = require("../../models/petModel/petModel");
const LostReport = require("../../models/lostReportModel/lostReportModel");

/**
 * @desc    Mark a pet as lost and create a lost report
 * @route   POST /api/lost/:petId
 * @access  Private (pet owner only)
 */
const markPetLost = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.user.id });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    if (pet.isLost) {
      return res.status(400).json({
        success: false,
        message: "This pet is already marked as lost",
      });
    }

    const { lastSeenLocation, lastSeenAt, notes, contactPhone } = req.body;

    const report = await LostReport.create({
      pet: pet._id,
      reportedBy: req.user.id,
      lastSeenLocation,
      lastSeenAt,
      notes,
      contactPhone,
    });

    pet.isLost = true;
    await pet.save();

    res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a lost report as resolved (pet found) and clear the pet's isLost flag
 * @route   PUT /api/lost/:id/resolve
 * @access  Private (pet owner only)
 */
const resolveLostReport = async (req, res, next) => {
  try {
    const report = await LostReport.findOne({
      _id: req.params.id,
      reportedBy: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Lost report not found",
      });
    }

    report.status = "resolved";
    report.resolvedAt = new Date();
    await report.save();

    await Pet.findByIdAndUpdate(report.pet, { isLost: false });

    res.status(200).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the community feed of currently active lost-pet reports
 * @route   GET /api/lost
 * @access  Public
 */
const getLostReports = async (req, res, next) => {
  try {
    const reports = await LostReport.find({ status: "active" })
      .populate("pet", "name species breed color photo petId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the logged-in user's own lost reports (active + resolved)
 * @route   GET /api/lost/my
 * @access  Private
 */
const getMyLostReports = async (req, res, next) => {
  try {
    const reports = await LostReport.find({ reportedBy: req.user.id })
      .populate("pet", "name species breed color photo petId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markPetLost,
  resolveLostReport,
  getLostReports,
  getMyLostReports,
};