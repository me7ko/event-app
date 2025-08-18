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

// GET /api/events (всички събития на потребителя или всички ако е админ)
router.get("/", authMiddleware, getUserEvents);

// GET едно събитие
router.get("/:id", authMiddleware, getEventById);

// POST /api/events (създаване на събитие)
router.post("/", authMiddleware, createEvent);

// PUT /api/events/:id (update)
router.put("/:id", authMiddleware, updateEvent);

// DELETE /api/events/:id (само админ може)
router.delete("/:id", authMiddleware, requireRole("admin"), deleteEvent);

module.exports = router;
