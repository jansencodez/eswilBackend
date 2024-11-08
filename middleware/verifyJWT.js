const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const verifyJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from "Authorization" header

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token is invalid or expired." });
    }

    req.user = decoded; // Attach the decoded user data (including role) to req.user
    next();
  });
};

module.exports = verifyJWT;
