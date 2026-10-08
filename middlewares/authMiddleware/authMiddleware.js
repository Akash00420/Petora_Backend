const jwt = require("jsonwebtoken");
const User = require("../../models/AuthModel/AuthModel");
const { SECRET_KEY } = require("../../utils/config");

/**
 * Protect routes - verifies JWT from the Authorization header,
 * attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid or expired",
    });
  }
};

module.exports = { protect };