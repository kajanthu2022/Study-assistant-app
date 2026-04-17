const Flashcard = require("../models/Flashcard");
const Note = require("../models/Note");
const groq = require("../config/groqClient");

const createFlashcard = async (req, res) => {
  try {
    const { term, definition, noteId } = req.body;
    const flashcard = await Flashcard.create({
      term, definition, noteId,
      userId: req.user.id
    });
    res.status(201).json(flashcard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ userId: req.user.id })
      .populate("noteId", "title");
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFlashcardById = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!flashcard) return res.status(404).json({ message: "Flashcard not found" });
    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!flashcard) return res.status(404).json({ message: "Flashcard not found" });
    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!flashcard) return res.status(404).json({ message: "Flashcard not found" });
    res.json({ message: "Flashcard deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateFlashcards = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.noteId,
      userId: req.user.id
    });
    if (!note) return res.status(404).json({ message: "Note not found" });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Generate 5 flashcards from this study note.
Return ONLY a valid JSON array with no extra text, like this:
[
  {
    "term": "Term or question here",
    "definition": "Definition or answer here"
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
      return res.status(500).json({ message: "Failed to parse flashcards from AI" });
    }

    const cards = JSON.parse(jsonMatch[0]);

    const flashcards = await Promise.all(
      cards.map(card =>
        Flashcard.create({
          term: card.term,
          definition: card.definition,
          noteId: note._id,
          userId: req.user.id
        })
      )
    );

    res.status(201).json(flashcards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFlashcard,
  getFlashcards,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
  generateFlashcards
};