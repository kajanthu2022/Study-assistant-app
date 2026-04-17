const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema({
  term: { type: String, required: true },
  definition: { type: String, required: true },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Flashcard", flashcardSchema);