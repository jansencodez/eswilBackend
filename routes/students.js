const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Guardian = require("../models/Guardian");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const verifyJWT = require("../middleware/verifyJWT");
const sendEmail = require("../utils/sendEmail");
const { logActivity } = require("../utils/logActivity");

// Get all students with guardian populated
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().populate("guardian");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student login
router.post("/login", async (req, res) => {
  const { name, studentId } = req.body;
  if (!name || !studentId) {
    return res
      .status(400)
      .json({ error: "Name and admission number are required." });
  }

  try {
    const student = await Student.findOne({ studentId });
    if (!student || student.name !== name) {
      return res.status(401).json({ error: "Invalid name or studentId" });
    }

    const token = jwt.sign(
      { studentId: student.studentId, name: student.name, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get students by grade
router.get("/grade/:grade", async (req, res) => {
  try {
    const students = await Student.find({ grade: req.params.grade }).populate(
      "guardian"
    );

    if (students.length === 0) {
      return res
        .status(404)
        .json({ message: `No students found in grade ${req.params.grade}` });
    }
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student dashboard
router.get("/dashboard", verifyJWT, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.user.studentId })
      .populate("guardian") // Populates the guardian field
      .populate("subjects") // Populates the subjects field
      .select("-password"); // Excludes the password field

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({
      error: "Something went wrong. Please try again later.",
    });
  }
});

// Add a new student
router.post("/enroll", verifyJWT, async (req, res) => {
  const { name, age, grade, enrollmentDate, fee_amount, guardian } = req.body;

  // Check for missing required fields
  if (!name || !age || !grade || !fee_amount || !guardian || !enrollmentDate) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Fetch teachers for the grade
    let teachers = await Teacher.find({ "subjects.grade": grade.toString() });
    if (teachers.length === 0) {
      return res
        .status(400)
        .json({ error: "No teachers available for this grade." });
    }

    // Handle guardian (check if guardian exists or create a new one)
    let guardianDoc;
    if (guardian._id) {
      guardianDoc = await Guardian.findById(guardian._id);
      if (!guardianDoc) {
        return res.status(400).json({ error: "Guardian not found." });
      }
    } else {
      guardianDoc = await Guardian.findOne({
        email: guardian.email,
        phone: guardian.phone,
      });

      if (!guardianDoc) {
        // Create new guardian if not found by email and phone
        guardianDoc = new Guardian(guardian);
        await guardianDoc.save();
      }
    }

    // Create new student
    const newStudent = new Student({
      name,
      age,
      grade,
      enrollmentDate,
      fee_amount: mongoose.Types.Decimal128.fromString(fee_amount.toString()),
      guardian: guardianDoc._id,
    });

    // Fetch subjects for the grade
    const subjects = await Subject.find({ grade: grade });

    // Assign subjects and teachers to the student
    newStudent.subjects = subjects.map((subject) => subject._id);
    newStudent.teachers = teachers.map((teacher) => teacher._id);

    // Save student
    await newStudent.save();

    const studentId = newStudent.studentId; // studentId is now available

    // Add student to guardian's student list
    guardianDoc.students.push(newStudent._id);
    await guardianDoc.save();

    // Send email to guardian
    const emailSubject = `Student Enrollment Confirmation for ${name}`;
    const emailMessage = `Dear ${guardian.name},\n\nYour child ${name} has been successfully enrolled in grade ${grade}.\n\nYour child can use their student ID ${studentId} to log in to the student portal.\n\nBest regards,\nSchool Enrollment Team`;
    await sendEmail({
      to: guardian.email,
      subject: emailSubject,
      message: emailMessage,
    });

    await logActivity(
      "Student self-enrolled",
      req.user ? req.user.name : "System"
    );

    // Respond with the newly created student
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student details
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, age, grade, enrollmentDate, fee_amount, guardian } = req.body;

  try {
    const student = await Student.findOne({ studentId: id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    Object.assign(student, { name, age, grade, enrollmentDate, fee_amount });

    if (guardian) {
      let guardianDoc = guardian._id
        ? await Guardian.findById(guardian._id)
        : new Guardian(guardian);
      if (!guardian._id) await guardianDoc.save();
      student.guardian = guardianDoc._id;
    }

    await student.save();
    res.json({ message: "Student updated successfully", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student fee amount
router.put("/:id/fee", async (req, res) => {
  const { id } = req.params;
  const { fee_amount } = req.body;

  if (!fee_amount)
    return res.status(400).json({ error: "Fee amount is required" });

  try {
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.fee_amount = fee_amount;
    await student.save();
    res.json({ message: "Fee amount updated successfully", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a student
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
