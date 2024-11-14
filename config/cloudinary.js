const cloudinary = require("cloudinary").v2;

// Automatically loads configuration from CLOUDINARY_URL in .env
cloudinary.config();

module.exports = cloudinary;
