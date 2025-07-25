const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createEvent,
  getUserEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

// GET /api/events (всички събития на потребителя)
router.get("/", authMiddleware, getUserEvents);

router.get("/:id", authMiddleware, getEventById); // едно събитие

// POST /api/events (създаване на събитие)
router.post("/", authMiddleware, createEvent);

router.put("/:id", authMiddleware, updateEvent); //update

// DELETE /api/events/:id
router.delete("/:id", authMiddleware, deleteEvent); //delete

module.exports = router;
