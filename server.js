/* ============================================
   SUPPLEMENT BLOG — MAIN SERVER
   File: server.js
   ============================================ */

// -- 1. IMPORTS --
const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");

dotenv.config();

const { initDb } = require("./db");

const app  = express();
const PORT = process.env.PORT || 3000;

// -- 2. MIDDLEWARE --
const allowedOrigins = [
  "http://localhost:8888",
  "http://localhost:3000",
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

// -- 3. ROUTES --
try {
  const postsRoute = require("./routes/posts");
  const adminRoute = require("./routes/admin");
  app.use("/api/posts", postsRoute);
  app.use("/api/admin", adminRoute);
  console.log("✅ Routes loaded successfully");
} catch (err) {
  console.error("⚠️ Routes failed to load:", err.message);
}

// -- 4. HEALTH CHECK --
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "SuppliFeed API is running." });
});

// -- 5. START SERVER --
(async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`✅ SuppliFeed API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
