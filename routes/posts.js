const express = require("express");
const router = express.Router();
const { queryAll, queryOne } = require("../db");

// GET /api/posts — list all posts (newest first)
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const category = req.query.category;

    let posts;
    if (category && category !== "all") {
      posts = await queryAll(
        "SELECT * FROM posts WHERE category = ? ORDER BY id DESC LIMIT ?",
        [category, limit]
      );
    } else {
      posts = await queryAll(
        "SELECT * FROM posts ORDER BY id DESC LIMIT ?",
        [limit]
      );
    }

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/:id — single post
router.get("/:id", async (req, res) => {
  try {
    const post = await queryOne(
      "SELECT * FROM posts WHERE id = ?",
      [req.params.id]
    );
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
