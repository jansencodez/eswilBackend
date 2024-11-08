const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  subjects: [
    {
      subjectName: { type: String, required: true },
      grade: { type: String, required: true }, // Class/Grade for this subject
      students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Students taking this subject
    },
  ],
});

module.exports = mongoose.model("Teacher", TeacherSchema);
