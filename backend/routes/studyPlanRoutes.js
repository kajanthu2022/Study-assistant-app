const express = require("express");
const router = express.Router();
const { createPlan, getPlans, updatePlan, deletePlan } = require("../controllers/studyPlanController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createPlan);
router.get("/", protect, getPlans);
router.put("/:id", protect, updatePlan);
router.delete("/:id", protect, deletePlan);

module.exports = router;