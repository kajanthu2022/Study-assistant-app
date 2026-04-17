const StudyPlan = require("../models/StudyPlan");

const createPlan = async (req, res) => {
  try {
    const { subject, date, duration } = req.body;
    const plan = await StudyPlan.create({
      userId: req.user.id,
      subject, date, duration
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user.id });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPlan, getPlans, updatePlan, deletePlan };
