const express = require("express");
const { db } = require("../config/db");
const router = express.Router();

// Get all students
router.get("/", (req, res) => {
  db.query("SELECT * FROM students", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add a new student
router.post("/", (req, res) => {
  const { name, grade, fee_amount } = req.body;

  db.query(
    "INSERT INTO students (name, grade, fee_amount) VALUES(?,?,?)",
    [name, grade, fee_amount], // Use `line_name` instead of `line_nam`
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: results.insertId });
    }
  );
});

// Update student fee amount
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { fee_amount } = req.body;

  db.query(
    "UPDATE students SET fee_amount = ? WHERE student_id = ?",
    [fee_amount, id], // Fix parameter array
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ affectedRows: results.affectedRows });
    }
  );
});

// Delete a student
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM students WHERE student_id = ?",
    [id], // Fix query and parameters
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ affectedRows: results.affectedRows });
    }
  );
});

module.exports = router;
