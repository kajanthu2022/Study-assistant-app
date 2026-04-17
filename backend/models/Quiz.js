const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: [String],
      correctAnswer: { type: String, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);