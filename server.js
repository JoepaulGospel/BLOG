/* ============================================
   SUPPLEMENT BLOG — MAIN SERVER
   File: server.js
   ============================================ */


// ── 1. IMPORTS ──
const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
const db      = require("./db");

// Load environment variables from .env file
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;


// ── 2. MIDDLEWARE ──
app.use(cors());             // Allow frontend to talk to backend
app.use(express.json());     // Parse incoming JSON requests


// ── 3. ROUTES ──
const postsRoute = require("./routes/posts");
const adminRoute = require("./routes/admin");

app.use("/api/posts", postsRoute);
app.use("/api/admin", adminRoute);


// ── 4. HEALTH CHECK ──
// Visit http://localhost:3000/health to confirm server is running
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "SuppliFeed server is running." });
});


// ── 5. ROOT ──
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the SuppliFeed API." });
});


// ── 6. 404 HANDLER ──
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});


// ── 7. ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Internal server error." });
});


// ── 8. START SERVER ──
app.listen(PORT, () => {
  console.log(`✅ SuppliFeed server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});