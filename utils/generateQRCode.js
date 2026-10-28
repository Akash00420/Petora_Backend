const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const QR_DIR = path.join(__dirname, "..", "uploads", "qrcodes");

if (!fs.existsSync(QR_DIR)) {
  fs.mkdirSync(QR_DIR, { recursive: true });
}

// Used only when CLIENT_URL isn't set in .env. "localhost" works on this computer only.
const FALLBACK_CLIENT_URL = "http://localhost:5173";

/**
 * Generate a QR code PNG that opens the pet's page directly when scanned
 * (<website address>/scan/<petId>), save it to disk, and return the relative path
 * to store on the Pet document.
 * @param {string} petId     - the pet's public petId (e.g. PET-4F7K2A)
 * @param {string} [baseUrl] - website address to put in the QR code; defaults to CLIENT_URL
 * @returns {Promise<string>} relative path, e.g. /uploads/qrcodes/PET-4F7K2A.png
 */
const generateQRCode = async (petId, baseUrl) => {
  let base = baseUrl || process.env.CLIENT_URL;

  if (!base) {
    base = FALLBACK_CLIENT_URL;
    console.warn(
      `⚠️  CLIENT_URL is not set in .env, so the QR code for ${petId} points to ${FALLBACK_CLIENT_URL}. ` +
        "That only opens on this computer. Set CLIENT_URL to your website address."
    );
  }

  const scanUrl = `${String(base).trim().replace(/\/+$/, "")}/scan/${petId}`;
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