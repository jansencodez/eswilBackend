const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// controllers/reportController.js
const Report = require("../models/Report");
const verifyJWT = require("../middleware/verifyJWT");

// POST: Create a new report
router.post("/create", verifyJWT, async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;

    if (!title || !assignedTo) {
      return res
        .status(400)
        .json({ message: "Title and assigned teacher are required." });
    }

    // Ensure assignedTo is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: "Invalid teacher ID." });
    }

    const newReport = new Report({
      title,
      description,
      assignedTo, // Reference to Teacher (mongoose ObjectId)
      status: "pending", // Default status
    });

    await newReport.save();
    return res.status(201).json(newReport);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating report" });
  }
});

// PUT: Update an existing report
router.put("/:id", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params; // Corrected `id` to be consistent
    const { title, description, status } = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    // Ensure the teacher is the one assigned to the report
    if (report.assignedTo.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this report." });
    }

    // Update report fields if provided
    if (title) report.title = title;
    if (description) report.description = description;
    if (status) report.status = status;

    report.updatedAt = Date.now();

    await report.save();
    return res.status(200).json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating report" });
  }
});

// Sample endpoint to fetch a report (Optional, for testing)
router.get("one/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching report" });
  }
});

router.get("/search", async (req, res) => {
  const { query } = req.query;

  // Trim and sanitize the query input
  const sanitizedQuery = query.trim();

  if (!sanitizedQuery) {
    return res.status(400).json({ message: "Query cannot be empty" });
  }

  // Check if the query is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(sanitizedQuery)) {
    // If it's a valid ObjectId, search by _id
    try {
      const report = await Report.findById(sanitizedQuery);
      if (!report) {
        return res.status(404).json({ message: "Report not found by ID" });
      }
      return res.json(report);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error finding report by ID", error });
    }
  } else {
    // Otherwise, search by title (case-insensitive)
    try {
      const report = await Report.findOne({
        title: { $regex: sanitizedQuery, $options: "i" }, // case-insensitive search
      });
      if (!report) {
        return res.status(404).json({ message: "Report not found by title" });
      }
      return res.json(report);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error finding report by title", error });
    }
  }
});

module.exports = router;
