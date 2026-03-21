const express = require("express");
const router = express.Router();
const { run } = require("../db");
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
router.post("/posts", async (req, res) => {
  try {
    const { title, excerpt, content, category, date, readTime, image } = req.body;

    const result = await run(
      `INSERT INTO posts (title, excerpt, content, category, date, readTime, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title, excerpt, content, category,
        date || new Date().toISOString().split("T")[0],
        readTime || "5 min read",
        image || null
      ]
    );

    res.json({ id: result.lastInsertRowid, message: "Post created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/posts/:id
router.delete("/posts/:id", async (req, res) => {
  try {
    await run("DELETE FROM posts WHERE id = ?", [req.params.id]);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
