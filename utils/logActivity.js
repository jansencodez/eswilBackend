const ActivityLog = require("../models/ActivityLog");

const logActivity = async (description, actor) => {
  try {
    // Create a new activity log with the description and actor
    await ActivityLog.create({ description, actor });
  } catch (err) {
    console.error("Error logging activity:", err);
  }
};

module.exports = { logActivity };
