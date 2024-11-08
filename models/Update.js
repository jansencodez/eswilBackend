const mongoose = require("mongoose");

const UpdateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 100 },
    image: { type: String, required: false, match: /^https?:\/\/.+/ },
    content: { type: String, required: true, minlength: 10, maxlength: 1000 },
    category: {
      type: String,
      required: true,
      enum: ["News", "Announcement", "Event"],
    },
  },
  { timestamps: true }
);

//index for category to improve query performance
UpdateSchema.index({ category: 1 });

const Update = mongoose.model("Update", UpdateSchema);

module.exports = Update;
