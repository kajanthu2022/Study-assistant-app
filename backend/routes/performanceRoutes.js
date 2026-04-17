const express = require("express");
const router = express.Router();
const { createResult, getResults, updateResult, deleteResult } = require("../controllers/performanceController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createResult);
router.get("/", protect, getResults);
router.put("/:id", protect, updateResult);
router.delete("/:id", protect, deleteResult);

module.exports = router;