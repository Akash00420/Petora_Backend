// models/petModel/petExtrasModel.js
// Spread these into your existing pet schema:  new Schema({ ...existingFields, ...extrasFields })
const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  dateGiven: Date,
  nextDue: Date, // used later for email reminders
  vet: { type: String, trim: true, maxlength: 80 },
  certificate: { type: String, default: "" }, // reserved for certificate photos (phase 2)
});

const parasiteSchema = new mongoose.Schema({
  type: { type: String, enum: ["deworming", "flea_tick"], default: "deworming" },
  product: { type: String, trim: true, maxlength: 80 },
  dateGiven: Date,
  nextDue: Date,
});

const extrasFields = {
  distinguishingMarks: { type: String, trim: true, maxlength: 300 },
  temperament: {
    notes: { type: String, trim: true, maxlength: 300 },
    approachWithCaution: { type: Boolean, default: false },
  },
  medical: {
    alerts: { type: String, trim: true, maxlength: 500 },
    showOnTag: { type: Boolean, default: false },
  },
  dateOfBirth: Date,
  weightKg: { type: Number, min: 0, max: 200 },
  neutered: { type: String, enum: ["yes", "no", "unknown"], default: "unknown" },
  vaccinations: { type: [vaccinationSchema], default: [] },
  parasiteTreatments: { type: [parasiteSchema], default: [] },
  vet: {
    clinicName: { type: String, trim: true, maxlength: 80 },
    phone: { type: String, trim: true, maxlength: 20 },
  },
  microchipNumber: { type: String, trim: true, maxlength: 40 },
  licenseNumber: { type: String, trim: true, maxlength: 40 },
  insuranceProvider: { type: String, trim: true, maxlength: 80 },
  insurancePolicy: { type: String, trim: true, maxlength: 60 },
};

module.exports = { extrasFields };