const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/posts — list all posts (newest first)
router.get("/", (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const category = req.query.category;

  let stmt;
  if (category && category !== "all") {
    stmt = db.prepare("SELECT * FROM posts WHERE category = ? ORDER BY id DESC LIMIT ?");
    const posts = stmt.all(category, limit);
    return res.json({ posts });
  }

  stmt = db.prepare("SELECT * FROM posts ORDER BY id DESC LIMIT ?");
  const posts = stmt.all(limit);
  res.json({ posts });
});

// GET /api/posts/:id — single post
router.get("/:id", (req, res) => {
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json({ post });
});

module.exports = router;
