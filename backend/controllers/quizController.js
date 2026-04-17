const Quiz = require("../models/Quiz");
const Note = require("../models/Note");
const groq = require("../config/groqClient");

const createQuiz = async (req, res) => {
  try {
    const { noteId, questions } = req.body;
    const quiz = await Quiz.create({
      noteId, questions,
      userId: req.user.id
    });
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user.id }).populate("noteId", "title");
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateQuiz = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.noteId, userId: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found" });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Generate 5 multiple choice questions based on this study note. 
Return ONLY a valid JSON array with no extra text, like this:
[
  {
    "question": "Question here?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A"
  }
]

Study note: ${note.content}`
        }
      ],
      model: "llama-3.3-70b-versatile"
    });

    const rawText = completion.choices[0].message.content;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ message: "Failed to parse quiz from AI" });
    }

    const questions = JSON.parse(jsonMatch[0]);

    const quiz = await Quiz.create({
      noteId: note._id,
      userId: req.user.id,
      questions
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz, generateQuiz };