const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Team = require("../models/Team");

// Get all teams
router.get("/", async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("creator_id", "username full_name avatar_url")
      .sort({ created_at: -1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get team by ID
router.get("/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("creator_id", "username full_name avatar_url")
      .populate("members.user_id", "username full_name avatar_url");

    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create team
router.post("/", auth, async (req, res) => {
  try {
    const team = new Team({
      name: req.body.name,
      description: req.body.description,
      creator_id: req.userId,
      members: [
        {
          user_id: req.userId,
          role: "owner",
        },
      ],
    });
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add team member
router.post("/:id/members", auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.members.push({
      user_id: req.body.userId,
      role: req.body.role || "member",
    });
    await team.save();
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get team members
router.get("/:id/members", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate(
      "members.user_id",
      "username full_name avatar_url"
    );

    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team.members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
