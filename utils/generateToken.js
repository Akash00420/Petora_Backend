const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT for a given user id.
 * @param {string} userId - Mongo ObjectId of the user
 * @returns {string} signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Attach a JWT as an httpOnly cookie on the response and return it in the body too.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieExpireDays = Number(process.env.JWT_COOKIE_EXPIRES_DAYS) || 7;

  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
};

module.exports = { generateToken, sendTokenResponse };