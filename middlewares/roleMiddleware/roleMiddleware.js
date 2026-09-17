/**
 * Restrict route access to specific roles.
 * Usage: router.delete('/:id', protect, authorize('admin'), deletePet)
 * @param  {...string} roles - allowed roles, e.g. 'admin', 'user'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no user on request",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not permitted to access this resource`,
      });
    }

    next();
  };
};

module.exports = { authorize };