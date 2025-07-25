const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// тестов маршрут:
router.get("/test", (req, res) => {
  res.json({ message: "Auth route works!" });
});

// реални маршрути:
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/me", authMiddleware, updateUser);
router.delete("/me", authMiddleware, deleteUser);

module.exports = router;
