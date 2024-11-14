// models/ActivityLog.js
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    description: { type: String, required: true }, // e.g., "New student added by Admin"
    actor: { type: String, required: true }, // e.g., "Admin" or "Teacher"
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
