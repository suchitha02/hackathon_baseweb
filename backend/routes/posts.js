const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Post = require("../models/Post");
const Like = require("../models/Like");
const Comment = require("../models/Comment");

// Get all posts
router.get("/", async (req, res) => {
  try {
    const { status, lookingForTeammates, orderBy } = req.query;
    const query = {};

    if (status) query.status = status;
    if (lookingForTeammates === "true") query.looking_for_teammates = true;

    const posts = await Post.find(query)
      .populate("author_id", "username full_name avatar_url")
      .populate("tags", "name")
      .sort(orderBy === "likes" ? { likes_count: -1 } : { created_at: -1 })
      .limit(20);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author_id", "username full_name avatar_url bio")
      .populate("tags", "name");

    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post
router.post("/", auth, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      author_id: req.userId,
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Like post
router.post("/:id/like", auth, async (req, res) => {
  try {
    const like = new Like({
      post_id: req.params.id,
      user_id: req.userId,
    });
    await like.save();

    await Post.findByIdAndUpdate(req.params.id, { $inc: { likes_count: 1 } });
    res.status(201).json({ message: "Post liked" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already liked" });
    }
    res.status(500).json({ message: error.message });
  }
});

// Unlike post
router.post("/:id/unlike", auth, async (req, res) => {
  try {
    await Like.findOneAndDelete({
      post_id: req.params.id,
      user_id: req.userId,
    });
    await Post.findByIdAndUpdate(req.params.id, { $inc: { likes_count: -1 } });
    res.json({ message: "Post unliked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get comments
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({
      post_id: req.params.id,
      parent_id: null,
    })
      .populate("author_id", "username full_name avatar_url")
      .sort({ created_at: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create comment
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const comment = new Comment({
      post_id: req.params.id,
      author_id: req.userId,
      content: req.body.content,
    });
    await comment.save();

    await Post.findByIdAndUpdate(req.params.id, {
      $inc: { comments_count: 1 },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
