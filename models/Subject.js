// models/Subject.js
const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true, // Define which grade this subject is for
  },
  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher", // Reference the Teacher model
    },
  ],
});

module.exports = mongoose.model("Subject", subjectSchema);
