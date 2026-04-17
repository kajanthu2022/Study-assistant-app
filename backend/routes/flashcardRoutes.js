const express = require("express");
const router = express.Router();
const {
  createFlashcard,
  getFlashcards,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
  generateFlashcards
} = require("../controllers/flashcardController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createFlashcard);
router.get("/", protect, getFlashcards);
router.get("/:id", protect, getFlashcardById);
router.put("/:id", protect, updateFlashcard);
router.delete("/:id", protect, deleteFlashcard);
router.post("/generate/:noteId", protect, generateFlashcards);

module.exports = router;