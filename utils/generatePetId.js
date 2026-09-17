const crypto = require("crypto");

/**
 * Generate a short, unique, human-friendly Pet ID.
 * Format: PET-XXXXXX (uppercase alphanumeric, 6 chars)
 * Uniqueness against the database is enforced by the caller (see petController),
 * which retries generation on the rare collision.
 * @returns {string}
 */
const generatePetId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  let code = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `PET-${code}`;
};

module.exports = generatePetId;