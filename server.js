/* ============================================
   SUPPLEMENT BLOG — MAIN SERVER
   File: server.js
   ============================================ */

// ── 1. IMPORTS ──
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const dotenv  = require("dotenv");

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── 2. MIDDLEWARE ──
app.use(cors());
app.use(express.json());

// ── 3. SERVE FRONTEND HTML FILES ──
// This serves your index.html, post.html etc directly
app.use(express.static(path.join(__dirname)));

// ── 4. ROUTES ──
try {
  const postsRoute = require("./routes/posts");
  const adminRoute = require("./routes/admin");
  app.use("/api/posts", postsRoute);
  app.use("/api/admin", adminRoute);
  console.log("✅ Routes loaded successfully");
} catch (err) {
  console.error("⚠️ Routes failed to load:", err.message);
}

// ── 5. HEALTH CHECK ──
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "SuppliFeed server is running." });
});

// ── 6. CATCH ALL — serve index.html for any unknown route ──
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── 7. START SERVER ──
app.listen(PORT, () => {
  console.log(`✅ SuppliFeed running on port ${PORT}`);
});