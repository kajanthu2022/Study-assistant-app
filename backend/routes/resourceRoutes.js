const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { uploadResource, getResources, updateResource, deleteResource } = require("../controllers/resourceController");
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
  const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post("/", protect, upload.single("file"), uploadResource);
router.get("/", protect, getResources);
router.put("/:id", protect, updateResource);
router.delete("/:id", protect, deleteResource);

module.exports = router;
