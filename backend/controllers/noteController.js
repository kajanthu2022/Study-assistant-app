const Note = require("../models/Note");
const groq = require("../config/groqClient");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const { AppError } = require("../middleware/errorMiddleware");
const { sendSuccess, sendCreated } = require("../utils/response");

// ── Utility: wrap async route handlers ───────────────────────────────────────
// Eliminates repetitive try/catch in every controller.
// Usage: router.post("/", protect, asyncHandler(createNote))
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ── CREATE note (typed) ───────────────────────────────────────────────────────
const createNote = asyncHandler(async (req, res) => {
  const { title, subject, content } = req.body;

  if (!title || !subject || !content) {
    throw new AppError("Title, subject, and content are required", 400);
  }

  const note = await Note.create({
    title,
    subject,
    content,
    userId: req.user.id,
  });

  sendCreated(res, note, "Note created successfully");
});

// ── CREATE note from PDF ──────────────────────────────────────────────────────
const createNoteFromPDF = asyncHandler(async (req, res) => {
  // Multer places the uploaded file at req.file
  if (!req.file) {
    throw new AppError("No PDF file uploaded", 400);
  }

  const { title, subject } = req.body;
  const filePath = req.file.path;

  let extractedText;
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    extractedText = pdfData.text.trim();
  } catch (parseError) {
    // Clean up the uploaded file before throwing
    fs.unlink(filePath, () => {});
    throw new AppError("Failed to parse PDF — ensure the file is not encrypted or corrupted", 422);
  } finally {
    // Always delete the temp file, success or failure
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, () => {});
    }
  }

  if (!extractedText) {
    throw new AppError(
      "Could not extract text from PDF — the file may be image-based or empty",
      422
    );
  }

  const note = await Note.create({
    title: title || req.file.originalname.replace(".pdf", ""),
    subject: subject || "General",
    content: extractedText,
    userId: req.user.id,
  });

  sendCreated(res, note, "Note created from PDF successfully");
});

// ── GET all notes ─────────────────────────────────────────────────────────────
const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
  sendSuccess(res, notes, "Notes fetched successfully");
});

// ── GET single note ───────────────────────────────────────────────────────────
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
  if (!note) throw new AppError("Note not found", 404);
  sendSuccess(res, note);
});

// ── UPDATE note ───────────────────────────────────────────────────────────────
const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!note) throw new AppError("Note not found", 404);
  sendSuccess(res, note, "Note updated successfully");
});

// ── DELETE note ───────────────────────────────────────────────────────────────
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!note) throw new AppError("Note not found", 404);
  sendSuccess(res, null, "Note deleted successfully");
});

// ── AI SUMMARIZE ──────────────────────────────────────────────────────────────
const summarizeNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
  if (!note) throw new AppError("Note not found", 404);

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Summarize the following study note in 3–5 clear bullet points:\n\n${note.content}`,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });

  const summary = completion.choices[0].message.content;
  await Note.findByIdAndUpdate(note._id, { summary });
  sendSuccess(res, { summary }, "Summary generated successfully");
});

// ── AI CHAT with note ─────────────────────────────────────────────────────────
const chatWithNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
  if (!note) throw new AppError("Note not found", 404);

  const { question } = req.body;
  if (!question) throw new AppError("Question is required", 400);

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Based on this study note:\n\n${note.content}\n\nAnswer this question:\n${question}`,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });

  const answer = completion.choices[0].message.content;
  sendSuccess(res, { answer }, "Answer generated successfully");
});

module.exports = {
  createNote,
  createNoteFromPDF,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  summarizeNote,
  chatWithNote,
};
