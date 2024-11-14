const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger"); // Optional, for logging purposes

const verifyJWT = (req, res, next) => {
  // Exempt only POST requests to /students/enroll
  if (req.method === "POST" && req.path === "/enroll") {
    logger.info("Exempting JWT verification for /students/enroll");
    return next(); // Skip JWT verification and move to the next middleware/route handler
  }

  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from 'Authorization' header

  if (!token) {
    return res.status(404).json({ error: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT
    req.user = decoded;
    next();
  } catch (err) {
    logger.error("Invalid token", err); // Log error, optional
    return res.status(401).json({ error: "Invalid token." });
  }
};

module.exports = verifyJWT;
