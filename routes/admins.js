const express = require("express");
const { db } = require("../config/db");
const bcrypt = require("bcrypt"); // Correct the import statement
const router = express.Router();

// Get all admins
router.get("/", (req, res) => {
  db.query("SELECT * FROM admins", (err, results) => {
    // Changed get to query
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add a new admin
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    db.query(
      "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId });
      }
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update admin details
router.put("/:id", async (req, res) => {
  const { id } = req.params; // Get the id from params
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    db.query(
      "UPDATE admins SET name = ?, email = ?, password = ? WHERE admin_id = ?",
      [name, email, hashedPassword, id], // Include id in the query
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ affectedRows: results.affectedRows });
      }
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Delete an admin
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM admins WHERE admin_id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ affectedRows: results.affectedRows });
  });
});

module.exports = router;
