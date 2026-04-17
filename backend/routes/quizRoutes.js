const express = require("express");
const router = express.Router();
const {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  generateQuiz
} = require("../controllers/quizController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createQuiz);
router.get("/", protect, getQuizzes);
router.get("/:id", protect, getQuizById);
router.put("/:id", protect, updateQuiz);
router.delete("/:id", protect, deleteQuiz);
router.post("/generate/:noteId", protect, generateQuiz);

module.exports = router;