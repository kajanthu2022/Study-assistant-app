const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

// ── Ensure uploads directory exists ──────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve uploaded files statically ──────────────────────────────────────────
app.use("/uploads", express.static(uploadsDir));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/notes", require("./routes/noteRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/performance", require("./routes/performanceRoutes"));
app.use("/api/studyplans", require("./routes/studyPlanRoutes"));
app.use("/api/resources", require("./routes/resourceRoutes"));
app.use("/api/flashcards", require("./routes/flashcardRoutes"));

app.get("/", (req, res) => {
  res.json({ success: true, message: "Study Assistant API is running" });
});

// ── Error middleware — MUST come after all routes ─────────────────────────────
// Order matters: notFound catches unmatched routes, errorHandler processes them
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
