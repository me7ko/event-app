const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");

const {
  createEvent,
  getUserEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

router.get("/", authMiddleware, getUserEvents);

router.get("/:id", authMiddleware, getEventById);

router.post("/", authMiddleware, createEvent);

router.put("/:id", authMiddleware, updateEvent);

router.delete("/:id", authMiddleware, requireRole("admin"), deleteEvent);

module.exports = router;
