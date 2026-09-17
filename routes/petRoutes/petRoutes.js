const express = require("express");
const router = express.Router();

const {
  createPet,
  getMyPets,
  getPet,
  updatePet,
  deletePet,
  getPublicPetProfile,
} = require("../../controllers/petController/petController");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");
const uploadPetPhoto = require("../../middlewares/uploadMiddleware/uploadMiddleware");

// Public route - must come before "/:id" so it isn't swallowed by it
router.get("/public/:petId", getPublicPetProfile);

router.post("/", protect, uploadPetPhoto.single("photo"), createPet);
router.get("/", protect, getMyPets);
router.get("/:id", protect, getPet);
router.put("/:id", protect, uploadPetPhoto.single("photo"), updatePet);
router.delete("/:id", protect, deletePet);

module.exports = router;