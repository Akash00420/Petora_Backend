const Pet = require("../../models/petModel/petModel");
const generatePetId = require("../../utils/generatePetId");
const generateQRCode = require("../../utils/generateQRCode");
const { recordScan } = require("../scanController/scanController");

/**
 * @desc    Create a new pet profile (generates petId + QR code)
 * @route   POST /api/pets
 * @access  Private
 */
const createPet = async (req, res, next) => {
  try {
    const { name, species, breed, age, gender, color, description, contactPhone } =
      req.body;

    if (!name || !species) {
      return res.status(400).json({
        success: false,
        message: "Pet name and species are required",
      });
    }

    // Generate a unique petId, retrying on the rare collision
    let petId;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      petId = generatePetId();
      const existing = await Pet.findOne({ petId });
      if (!existing) isUnique = true;
      attempts += 1;
    }
    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: "Could not generate a unique pet ID, please try again",
      });
    }

    const qrCodeUrl = await generateQRCode(petId);

    const pet = await Pet.create({
      petId,
      owner: req.user.id,
      name,
      species,
      breed,
      age,
      gender,
      color,
      description,
      contactPhone,
      photo: req.file ? `/uploads/pets/${req.file.filename}` : "",
      qrCodeUrl,
    });

    res.status(201).json({ success: true, pet });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all pets belonging to the logged-in user
 * @route   GET /api/pets
 * @access  Private
 */
const getMyPets = async (req, res, next) => {
  try {
    const pets = await Pet.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, count: pets.length, pets });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single pet by Mongo _id (must belong to the logged-in user)
 * @route   GET /api/pets/:id
 * @access  Private
 */
const getPet = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.user.id });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    res.status(200).json({ success: true, pet });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a pet's profile
 * @route   PUT /api/pets/:id
 * @access  Private
 */
const updatePet = async (req, res, next) => {
  try {
    let pet = await Pet.findOne({ _id: req.params.id, owner: req.user.id });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    const allowedFields = [
      "name",
      "species",
      "breed",
      "age",
      "gender",
      "color",
      "description",
      "contactPhone",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        pet[field] = req.body[field];
      }
    });

    if (req.file) {
      pet.photo = `/uploads/pets/${req.file.filename}`;
    }

    await pet.save();

    res.status(200).json({ success: true, pet });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a pet profile
 * @route   DELETE /api/pets/:id
 * @access  Private
 */
const deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    res.status(200).json({ success: true, message: "Pet deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a pet's public profile by petId (used when a QR code is scanned)
 * @route   GET /api/pets/public/:petId
 * @access  Public
 */
const getPublicPetProfile = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ petId: req.params.petId }).populate(
      "owner",
      "name phone email"
    );

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "No pet found with this QR code",
      });
    }

    res.status(200).json({
      success: true,
      pet: {
        petId: pet.petId,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        color: pet.color,
        photo: pet.photo,
        isLost: pet.isLost,
        ownerName: pet.owner?.name,
        ownerPhone: pet.owner?.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPet,
  getMyPets,
  getPet,
  updatePet,
  deletePet,
  getPublicPetProfile,
};