const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role; // Assuming req.user is populated after JWT verification

    if (!userRole) {
      return res.status(403).json({ error: "User role not found." });
    }

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ error: "Access denied. Insufficient role." });
    }

    next();
  };
};

module.exports = authorizeRole;
