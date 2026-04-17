const mongoose = require("mongoose");

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: { type: String, default: "pending", enum: ["pending", "completed", "skipped"] }
}, { timestamps: true });

module.exports = mongoose.model("StudyPlan", studyPlanSchema);