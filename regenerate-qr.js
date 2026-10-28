/**
 * Re-create the QR code image for every pet so each one opens that pet's page directly.
 *
 * Run from the backend folder:
 *   node regenerate-qr.js                          (uses CLIENT_URL from .env)
 *   node regenerate-qr.js http://192.168.1.23:5173 (uses the address you pass)
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Pet = require("./models/petModel/petModel");
const generateQRCode = require("./utils/generateQRCode");

const regenerateAll = async (baseUrl) => {
  const pets = await Pet.find({}, "petId");

  for (const pet of pets) {
    const qrCodeUrl = await generateQRCode(pet.petId, baseUrl);
    await Pet.updateOne({ _id: pet._id }, { qrCodeUrl });
    console.log(`✅ ${pet.petId} -> ${baseUrl.replace(/\/+$/, "")}/scan/${pet.petId}`);
  }

  return pets.length;
};

if (require.main === module) {
  (async () => {
    const baseUrl = process.argv[2] || process.env.CLIENT_URL;

    if (!baseUrl) {
      console.error(
        "No website address given. Set CLIENT_URL in .env, or run: node regenerate-qr.js http://192.168.1.23:5173"
      );
      process.exit(1);
    }

    try {
      await mongoose.connect(process.env.MONGO_URI);
      const count = await regenerateAll(baseUrl);
      console.log(`Done. ${count} QR code(s) regenerated.`);
    } catch (error) {
      console.error("❌ Could not regenerate QR codes:", error.message);
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
    }
  })();
}

module.exports = regenerateAll;