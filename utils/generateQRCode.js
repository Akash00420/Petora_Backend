const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const QR_DIR = path.join(__dirname, "..", "uploads", "qrcodes");

if (!fs.existsSync(QR_DIR)) {
  fs.mkdirSync(QR_DIR, { recursive: true });
}

/**
 * Generate a QR code PNG that encodes the public scan URL for a pet,
 * save it to disk, and return the relative path to store on the Pet document.
 * @param {string} petId - the pet's public petId (e.g. PET-4F7K2A)
 * @returns {Promise<string>} relative path, e.g. /uploads/qrcodes/PET-4F7K2A.png
 */
const generateQRCode = async (petId) => {
  const scanUrl = `${process.env.CLIENT_URL}/scan/${petId}`;
  const fileName = `${petId}.png`;
  const filePath = path.join(QR_DIR, fileName);

  await QRCode.toFile(filePath, scanUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 400,
  });

  return `/uploads/qrcodes/${fileName}`;
};

module.exports = generateQRCode;