const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Post = require("../models/Post");

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "interests",
      "name"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put("/:id", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: Date.now() },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user posts
router.get("/:id/posts", async (req, res) => {
  try {
    const posts = await Post.find({ author_id: req.params.id })
      .populate("tags", "name")
      .sort({ created_at: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user stats
router.get("/:id/stats", async (req, res) => {
  try {
    const postsCount = await Post.countDocuments({ author_id: req.params.id });
    const posts = await Post.find({ author_id: req.params.id });

    const totalLikes = posts.reduce((sum, post) => sum + post.likes_count, 0);
    const totalComments = posts.reduce(
      (sum, post) => sum + post.comments_count,
      0
    );

    res.json({
      myPosts: postsCount,
      totalLikes,
      totalComments,
      followers: 0, // Implement follow system
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
