// utils/petExtras.js
// parseExtras(req.body)  -> validated fields to save on create / update
// publicExtras(pet)      -> ONLY what a finder who scans the tag may see

// Edit this list to change what is public. Everything else stays owner-only.
const PUBLIC_FIELDS = [
  "distinguishingMarks",
  "temperament",
  "dateOfBirth",
  "weightKg",
  "neutered",
  "vaccinations",
];
// medical.alerts is public only when the owner ticks "show on tag" (handled below).

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const bool = (v) => v === true || v === "true";
const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const parseExtras = (body) => {
  let raw = body.extras;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return { error: "Invalid pet details format" };
    }
  }
  if (!raw || typeof raw !== "object") return { data: {} };

  const data = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(raw, k);

  if (has("distinguishingMarks")) data.distinguishingMarks = str(raw.distinguishingMarks, 300);

  if (has("temperament")) {
    data.temperament = {
      notes: str(raw.temperament?.notes, 300),
      approachWithCaution: bool(raw.temperament?.approachWithCaution),
    };
  }

  if (has("medical")) {
    data.medical = {
      alerts: str(raw.medical?.alerts, 500),
      showOnTag: bool(raw.medical?.showOnTag),
    };
  }

  if (has("dateOfBirth")) {
    const dob = toDate(raw.dateOfBirth);
    if (dob && dob > new Date()) return { error: "Date of birth cannot be in the future" };
    data.dateOfBirth = dob;
  }

  if (has("weightKg")) {
    if (raw.weightKg === "" || raw.weightKg === null) {
      data.weightKg = null;
    } else {
      const w = Number(raw.weightKg);
      if (Number.isNaN(w) || w < 0 || w > 200) return { error: "Please enter a valid weight (0-200 kg)" };
      data.weightKg = w;
    }
  }

  if (has("neutered")) {
    data.neutered = ["yes", "no", "unknown"].includes(raw.neutered) ? raw.neutered : "unknown";
  }

  if (has("vaccinations") && Array.isArray(raw.vaccinations)) {
    data.vaccinations = raw.vaccinations
      .slice(0, 30)
      .map((v) => ({
        name: str(v?.name, 60),
        dateGiven: toDate(v?.dateGiven),
        nextDue: toDate(v?.nextDue),
        vet: str(v?.vet, 80),
      }))
      .filter((v) => v.name);
  }

  if (has("parasiteTreatments") && Array.isArray(raw.parasiteTreatments)) {
    data.parasiteTreatments = raw.parasiteTreatments
      .slice(0, 30)
      .map((p) => ({
        type: p?.type === "flea_tick" ? "flea_tick" : "deworming",
        product: str(p?.product, 80),
        dateGiven: toDate(p?.dateGiven),
        nextDue: toDate(p?.nextDue),
      }))
      .filter((p) => p.dateGiven || p.nextDue);
  }

  if (has("vet")) {
    data.vet = { clinicName: str(raw.vet?.clinicName, 80), phone: str(raw.vet?.phone, 20) };
  }

  if (has("microchipNumber")) data.microchipNumber = str(raw.microchipNumber, 40);
  if (has("licenseNumber")) data.licenseNumber = str(raw.licenseNumber, 40);
  if (has("insuranceProvider")) data.insuranceProvider = str(raw.insuranceProvider, 80);
  if (has("insurancePolicy")) data.insurancePolicy = str(raw.insurancePolicy, 60);

  return { data };
};

const publicExtras = (pet) => {
  const p = pet && typeof pet.toObject === "function" ? pet.toObject() : pet || {};
  const out = {};

  PUBLIC_FIELDS.forEach((key) => {
    if (p[key] !== undefined && p[key] !== null) out[key] = p[key];
  });

  if (p.medical?.showOnTag && p.medical.alerts) {
    out.medical = { alerts: p.medical.alerts, showOnTag: true };
  }

  // never expose the (future) certificate files path list unless you decide to
  if (Array.isArray(out.vaccinations)) {
    out.vaccinations = out.vaccinations.map(({ name, dateGiven, nextDue, vet }) => ({
      name,
      dateGiven,
      nextDue,
      vet,
    }));
  }

  return out;
};

module.exports = { parseExtras, publicExtras, PUBLIC_FIELDS };