const express = require("express");
const router = express.Router();
const db = require("../db");
const { runJob } = require("../scheduler");

// GET /api/admin/generate — trigger auto post generation (used by external cron)
router.get("/generate", async (req, res) => {
  try {
    const post = await runJob();
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/posts — create a new post
router.post("/posts", (req, res) => {
  const { title, excerpt, content, category, date, readTime, image } = req.body;

  const stmt = db.prepare(`
    INSERT INTO posts (title, excerpt, content, category, date, readTime, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    title, excerpt, content, category,
    date || new Date().toISOString().split("T")[0],
    readTime || "5 min read",
    image || null
  );

  res.json({ id: result.lastInsertRowid, message: "Post created" });
});

// DELETE /api/admin/posts/:id
router.delete("/posts/:id", (req, res) => {
  db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
  res.json({ message: "Post deleted" });
});

module.exports = router;
