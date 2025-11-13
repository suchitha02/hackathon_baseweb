const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// Mock notifications for now
router.get("/users/:userId/notifications", auth, async (req, res) => {
  try {
    // Return mock data - implement real notifications later
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
