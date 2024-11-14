// models/StatisticalReport.js
const mongoose = require("mongoose");

const statisticalReportSchema = new mongoose.Schema(
  {
    totalStudents: { type: Number, required: true, default: 0 },
    totalTeachers: { type: Number, required: true, default: 0 },
    reportsGenerated: { type: Number, required: true, default: 0 },
    monthlyReports: [
      {
        month: { type: String, required: true },
        reports: { type: Number, required: true },
      },
    ],
    recentActivities: [
      {
        date: { type: Date, required: true },
        reportType: { type: String, required: true },
        generatedBy: { type: String, required: true },
        status: {
          type: String,
          enum: ["pending", "in-progress", "completed"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("StatisticalReport", statisticalReportSchema);
