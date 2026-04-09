const express = require("express");
const router  = express.Router();
const { run, queryAll } = require("../db");
const { runJob }        = require("../scheduler");

// GET /api/admin/generate — trigger post generation (external cron or manual)
router.get("/generate", async (req, res) => {
  try {
    const post = await runJob();
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/status — see all questions and how many answers used
router.get("/status", async (req, res) => {
  try {
    const rows = await queryAll(
      "SELECT question, answer_topic, date FROM posts ORDER BY id DESC"
    );
    res.json({ posts: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/posts — manually create a post
router.post("/posts", async (req, res) => {
  try {
    const { title, excerpt, content, category, question, answer_topic, date, readTime, image } = req.body;

    const result = await run(
      `INSERT INTO posts (title, excerpt, content, category, question, answer_topic, date, readTime, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, excerpt, content, category,
        question     || null,
        answer_topic || null,
        date         || new Date().toISOString().split("T")[0],
        readTime     || "5 min read",
        image        || null
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