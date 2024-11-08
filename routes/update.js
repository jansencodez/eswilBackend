const express = require("express");
const Update = require("../models/Update");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const updates = await Update.find();
    res.json(updates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/", async (req, res) => {
  const { title, content } = req.body;

  // Simple validation
  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const newUpdate = new Update(req.body);
    await newUpdate.save();
    res.status(201).json({ message: "successful", data: newUpdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
