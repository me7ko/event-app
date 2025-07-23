const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/events (protected)
router.get("/", authMiddleware, (req, res) => {
  res.json({
    message: `Welcome user ${req.user.id}, this is your protected events route.`,
  });
});

module.exports = router;
