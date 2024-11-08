const express = require("express");
const Student = require("../models/Student"); // Import the Student model
const Guardian = require("../models/Guardian"); // Import the Guardian model
const { default: mongoose } = require("mongoose");
const router = express.Router();

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().populate("guardian"); // Populate the guardian field
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all students in a specific grade
router.get("/grade/:grade", async (req, res) => {
  const { grade } = req.params;

  try {
    const students = await Student.find({ grade }).populate("guardian");

    if (students.length === 0) {
      return res
        .status(404)
        .json({ message: `No students found in grade ${grade}` });
    }

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single student by ID
router.get("/student", async (req, res) => {
  const studentId = req.headers["x-student-id"]; // destructuring the id from params

  try {
    const student = await Student.findOne({ studentId }).populate("guardian");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const studentData = student.toObject();

    studentData.fee_amount = studentData.fee_amount.toString();

    res.json(studentData);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

// Add a new student
router.post("/", async (req, res) => {
  const { name, age, grade, enrollmentDate, guardian } = req.body;
  const { fee_amount } = req.body;
  const feeAmountDecimal = mongoose.Types.Decimal128.fromString(
    fee_amount.toString()
  );

  if (!name || !age || !grade || !fee_amount || !guardian || !enrollmentDate) {
    return res.status(400).json({
      error:
        "Name, grade, fee amount, age, guardian, and enrollment date are required",
    });
  }

  try {
    // Check if guardian exists, if not, create one
    let guardianDoc;
    if (guardian._id) {
      guardianDoc = await Guardian.findById(guardian._id); // Look up the existing guardian
    } else {
      // If no guardian ID is passed, create a new guardian
      guardianDoc = new Guardian({
        name: guardian.name,
        relationship: guardian.relationship,
        phone: guardian.phone,
        email: guardian.email,
      });
      await guardianDoc.save();
    }

    const newStudent = new Student({
      name,
      age,
      grade,
      enrollmentDate,
      fee_amount: feeAmountDecimal,
      guardian: guardianDoc._id, // Reference to the guardian's ObjectId
    });

    await newStudent.save();

    // Add student to guardian's student array (optional)
    guardianDoc.student.push(newStudent._id);
    await guardianDoc.save();

    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student's name, grade, email, phone, fee amount, or guardian
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, age, grade, enrollmentDate, fee_amount, guardian } = req.body;

  if (!name && !grade && !fee_amount && !guardian && !enrollmentDate) {
    return res.status(400).json({
      error:
        "At least one field (name, age, grade, email, phone, fee_amount, guardian, enrollmentDate) must be provided",
    });
  }

  try {
    const student = await Student.findOne({ studentId: id });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.name = name || student.name;
    student.age = age || student.age;
    student.grade = grade || student.grade;
    student.enrollmentDate = enrollmentDate || student.enrollmentDate;
    student.fee_amount = fee_amount || student.fee_amount;

    // If a guardian is passed, update it
    if (guardian) {
      let guardianDoc;
      if (guardian._id) {
        guardianDoc = await Guardian.findById(guardian._id); // Look up the existing guardian
      } else {
        guardianDoc = new Guardian({
          name: guardian.name,
          relationship: guardian.relationship,
          phone: guardian.phone,
          email: guardian.email,
        });
        await guardianDoc.save();
      }

      student.guardian = guardianDoc._id; // Update the student with the new guardian
    }

    await student.save();
    res.json({ message: "Student updated successfully", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student's fee amount
router.put("/:id/fee", async (req, res) => {
  const { id } = req.params;
  const { fee_amount } = req.body;

  if (!fee_amount) {
    return res.status(400).json({ error: "Fee amount is required" });
  }

  try {
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.fee_amount = fee_amount;
    await student.save();

    res.json({ message: "Fee amount updated successfully", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a student
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
