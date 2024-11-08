const mongoose = require("mongoose");

const GuardianSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false },
  relationship: { type: String, required: true },
  phone: { type: String, required: true },
  student: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
});

module.exports = mongoose.model("Guardian", GuardianSchema);
