const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

// тестов маршрут:
router.get("/test", (req, res) => {
  res.json({ message: "Auth route works!" });
});

// реален маршрут:
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
