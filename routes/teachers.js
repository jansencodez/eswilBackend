const express = require("express");
const Teacher = require("../models/Teacher"); // Import the Teacher model
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

// Get all teachers
router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find().populate("subjects.students"); // Populate students in subjects
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Uncomment if you want password verification
    // const isPasswordValid = await bcrypt.compare(password, teacher.password);
    // if (!isPasswordValid) {
    //   return res.status(400).json({ error: "Invalid email or password" });
    // }

    // Generate JWT token
    const token = jwt.sign({ id: teacher._id, role: "teacher" }, jwtSecret, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single teacher by ID
router.get("/dashboard", verifyJWT, async (req, res) => {
  const { id } = req.user; // `id` is available from the decoded token

  try {
    const teacher = await Teacher.findById(id)
      .populate("subjects.students") // Populate students in subjects
      .exec();

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new teacher
router.post("/", async (req, res) => {
  const { name, email, phone, subjects } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const newTeacher = new Teacher({
      name,
      email,
      phone,
      subjects,
    });

    await newTeacher.save();
    res.status(201).json(newTeacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update teacher's information
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, subjects } = req.body;

  try {
    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    teacher.name = name || teacher.name;
    teacher.email = email || teacher.email;
    teacher.phone = phone || teacher.phone;
    teacher.subjects = subjects || teacher.subjects;

    await teacher.save();
    res.json({ message: "Teacher updated successfully", teacher });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a specific subject for a teacher
router.put("/:teacherId/subjects/:subjectId", async (req, res) => {
  const { teacherId, subjectId } = req.params;
  const { subjectName, grade, students } = req.body;

  try {
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const subject = teacher.subjects.id(subjectId);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    subject.subjectName = subjectName || subject.subjectName;
    subject.grade = grade || subject.grade;
    subject.students = students || subject.students;

    await teacher.save();
    res.json({ message: "Subject updated successfully", teacher });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a teacher
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const teacher = await Teacher.findByIdAndDelete(id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a subject from a teacher's profile
router.delete("/:teacherId/subjects/:subjectId", async (req, res) => {
  const { teacherId, subjectId } = req.params;

  try {
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const subject = teacher.subjects.id(subjectId);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    subject.remove();
    await teacher.save();
    res.json({ message: "Subject deleted successfully", teacher });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
