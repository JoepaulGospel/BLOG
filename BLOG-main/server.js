/* ============================================
   SUPPLIFEED — MAIN SERVER
   File: server.js
   ============================================ */

const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");

dotenv.config();

const { initDb } = require("./db");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:8888",
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  process.env.NETLIFY_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use(express.json());

// ── ROUTES ────────────────────────────────────────────────────
try {
  app.use("/api/posts", require("./routes/posts"));
  app.use("/api/admin", require("./routes/admin"));
  console.log("✅ Routes loaded");
} catch (err) {
  console.error("⚠️ Routes failed to load:", err.message);
}

// ── HEALTH CHECK ──────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "SuppliFeed API is running." });
});

// ── START ─────────────────────────────────────────────────────
(async () => {
  try {
    await initDb();

    // Start the scheduler (daily auto-posting)
    require("./scheduler");

    app.listen(PORT, () => {
      console.log(`✅ SuppliFeed API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();