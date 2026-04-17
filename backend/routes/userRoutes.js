const express = require("express");
const router = express.Router();
const { getAllUsers, updateUser, deleteUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAllUsers);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;