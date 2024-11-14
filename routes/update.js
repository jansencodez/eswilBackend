const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary"); // Import Cloudinary config
const streamifier = require("streamifier"); // Import streamifier to create a stream from buffer
const Update = require("../models/Update");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
}).single("image");

router.get("/", async (req, res) => {
  try {
    const updates = await Update.find();
    res.json(updates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/", upload, async (req, res) => {
  // Corrected here
  const { title, content, category } = req.body;

  // Simple validation
  if (!title || !content || !category) {
    return res
      .status(400)
      .json({ message: "Title, content, and category are required" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Image is required" });
  }

  try {
    // Convert buffer to stream using streamifier
    const stream = streamifier.createReadStream(req.file.buffer);

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const cloudinaryStream = cloudinary.uploader.upload_stream(
        { folder: "eswil_updates" }, // Specify the folder on Cloudinary
        (error, cloudinaryResult) => {
          if (error) {
            reject(error);
          } else {
            resolve(cloudinaryResult);
          }
        }
      );

      // Pipe the buffer as a stream into Cloudinary
      stream.pipe(cloudinaryStream);
    });

    // Create a new update with the Cloudinary image URL
    const newUpdate = new Update({
      title,
      content,
      category,
      image: uploadResult.secure_url, // Cloudinary URL
    });

    // Save the new update to the database
    await newUpdate.save();

    // Send response after successful update creation
    return res
      .status(201)
      .json({ message: "Update created successfully", data: newUpdate });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      return res.status(500).json({
        message: "Error uploading image to Cloudinary or saving the update",
        error: error.message,
      });
    }
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the update to be deleted
    const updateToDelete = await Update.findById(id);

    if (!updateToDelete) {
      return res.status(404).json({ message: "Update not found" });
    }

    // Delete image from Cloudinary (if an image exists)
    if (updateToDelete.image) {
      const publicId = updateToDelete.image.split("/").pop().split(".")[0]; // Extract public ID from URL
      await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary
    }

    // Delete the update from the database
    await Update.findByIdAndDelete(id);

    return res.status(200).json({ message: "Update deleted successfully" });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Server Error" });
    }
  }
});

module.exports = router;
