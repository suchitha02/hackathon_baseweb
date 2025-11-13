const express = require("express");
const router = express.Router();
const Tag = require("../models/Tag");

// Get all tags
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create tag
router.post("/", async (req, res) => {
  try {
    const tag = new Tag({ name: req.body.name });
    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Tag already exists" });
    }
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
