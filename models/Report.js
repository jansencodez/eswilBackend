// models/Report.js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g., "Student Performance Report"
    description: { type: String }, // Details of the report
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }, // Reference to a Teacher or Admin
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
