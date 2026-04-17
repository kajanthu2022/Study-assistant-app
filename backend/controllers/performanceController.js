const Performance = require("../models/Performance");

const createResult = async (req, res) => {
  try {
    const { quizId, score, totalQuestions, weakAreas } = req.body;
    const result = await Performance.create({
      userId: req.user.id,
      quizId, score, totalQuestions, weakAreas
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResults = async (req, res) => {
  try {
    const results = await Performance.find({ userId: req.user.id }).populate("quizId");
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateResult = async (req, res) => {
  try {
    const result = await Performance.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteResult = async (req, res) => {
  try {
    const result = await Performance.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.json({ message: "Result deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createResult, getResults, updateResult, deleteResult };