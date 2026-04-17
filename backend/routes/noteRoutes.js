const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createNote,
  createNoteFromPDF,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  summarizeNote
} = require("../controllers/noteController");
const { protect } = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() === ".pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post("/", protect, createNote);
router.post("/upload-pdf", protect, upload.single("pdf"), createNoteFromPDF);
router.get("/", protect, getNotes);
router.get("/:id", protect, getNoteById);
router.put("/:id", protect, updateNote);
router.delete("/:id", protect, deleteNote);
router.post("/:id/summarize", protect, summarizeNote);

module.exports = router;