const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const jwtSecret = process.env.JWT_SECRET;
const authorizeRole = require("../middleware/authorizeRole"); // Role-based authorization middleware
const verifyJWT = require("../middleware/verifyJWT"); // JWT verification middleware

const router = express.Router();

// Get all admins (requires authorization)
router.get("/", verifyJWT, authorizeRole(["superadmin"]), async (req, res) => {
  try {
    const admins = await Admin.find(); // Fetch all admins
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific admin by ID (requires authorization)
router.get(
  "/:id",
  verifyJWT,
  authorizeRole(["superadmin", "admin"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      const admin = await Admin.findById(id); // Fetch admin by ID
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }
      res.json(admin);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Admin login (does not require authentication)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email }); // Find admin by email

    if (!admin) {
      return res.status(400).json({ error: "Admin not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id, role: admin.role }, jwtSecret, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new admin (requires admin role)
router.post("/", verifyJWT, authorizeRole(["superadmin"]), async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      role, // Role passed in the request body, defaults to 'admin'
    });

    await newAdmin.save(); // Save to MongoDB

    res.status(201).json({ id: newAdmin._id }); // Return the new admin's ID
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update admin details (requires admin role)
router.put(
  "/:id",
  verifyJWT,
  authorizeRole(["superadmin", "admin"]),
  async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    try {
      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : undefined; // Hash password if it is being updated

      const updatedAdmin = await Admin.findByIdAndUpdate(
        id,
        { name, email, password: hashedPassword, role },
        { new: true } // Return the updated document
      );

      if (!updatedAdmin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      res.json(updatedAdmin);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete an admin (requires superadmin role)
router.delete(
  "/:id",
  verifyJWT,
  authorizeRole(["superadmin"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      const deletedAdmin = await Admin.findByIdAndDelete(id); // Delete admin by ID

      if (!deletedAdmin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      res.json({ message: "Admin deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Logout (optional)
router.post("/logout", (req, res) => {
  // Invalidate the token on client-side by removing it from storage
  // This is a client-side operation (on the front-end)
  res.json({ message: "Logged out successfully" });
});

// Update admin's role (for example, changing role to 'superadmin')
router.put(
  "/:id/role",
  verifyJWT,
  authorizeRole(["superadmin"]),
  async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
      const updatedAdmin = await Admin.findByIdAndUpdate(
        id,
        { role },
        { new: true } // Return the updated document
      );

      if (!updatedAdmin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      res.json(updatedAdmin);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
