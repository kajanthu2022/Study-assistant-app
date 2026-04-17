const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  weakAreas: [String]
}, { timestamps: true });

module.exports = mongoose.model("Performance", performanceSchema);