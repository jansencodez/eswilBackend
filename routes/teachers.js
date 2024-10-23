const express = require("express");
const { db } = require("../config/db");
const bcrypt = require("bcrypt"); // Correct the import statement
const router = express.Router();

router.post("/", (req, res) => {
  const { name, subject, classes, salary, role } = req.body;

  db.query(
    "INSERT INTO teachers (name, subject, classes, salary, role) VALUES (?,?,?,?,?)",
    [name, subject, classes, salary, role],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: results.id });
    }
  );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, subject, classes, salary, role } = req.body;

  db.query(
    "UPDATE teachers SET name=?, subject=?, classes=?, salary=?,role=?",
    [name, subject, JSON.stringify(classes), salary, role, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ affectedRows: results.affectedRows });
    }
  );
});

router.get("/", (req, res) => {
  db.query("SELECT * FROM teachers", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const teachers = results.map((teacher) => ({
      ...teachers,
      classes: JSON.parse(teacher.classes),
    }));
    res.json(teachers);
  });
});

router.delete("/:", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM teachers WHERE teacher_id=?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ affectedRows: results.affectedRows });
  });
});

module.exports = router;
