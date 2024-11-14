const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
    },
    name: { type: String, required: true },
    age: {
      type: Number,
      default: 0,
      min: [0, "Age must be a positive number"],
    },
    grade: {
      type: String,
      required: true,
    },
    enrollmentDate: { type: Date, required: true },
    fee_amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: [0, "Fee amount must be a positive number"],
    },
    guardian: { type: mongoose.Schema.Types.ObjectId, ref: "Guardian" },
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true, // Keeps the field required
      },
    ],
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject", // Reference to the Subject model
      },
    ],
  },
  { timestamps: true } // Automatically add createdAt and updatedAt
);

// Pre-save hook to generate studentId
StudentSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Only generate ID for new documents

  const currentYear = new Date().getFullYear().toString().slice(-2); // Get last two digits of the year, e.g., "24" for 2024
  const studentCount = await mongoose.model("Student").countDocuments({
    studentId: { $regex: `^${currentYear}/` }, // Find all students with IDs that start with the current year
  });

  // Format student ID: "year/00001", "year/00002", etc.
  const studentNumber = (studentCount + 1).toString().padStart(5, "0");
  this.studentId = `${currentYear}/${studentNumber}`;

  next(); // Proceed with saving the document
});

module.exports = mongoose.model("Student", StudentSchema);
