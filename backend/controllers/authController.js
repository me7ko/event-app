const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const knex = require("knex")(
  require(path.join(__dirname, "../../knexfile")).development
);

// helper: подписва access токен и включва role
const signAccessToken = (user) =>
  jwt.sign(
    { userId: user.id, role: user.role || "user" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

// POST /api/auth/register
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await knex("users").where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // дефолтна роля "user"
    const [newUser] = await knex("users")
      .insert({
        email,
        password: hashedPassword,
        role: "user",
      })
      .returning(["id", "email", "role"]);

    const token = signAccessToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token, // запазваме съвместимостта с фронта
    });
  } catch (err) {
    console.error("Error registering user:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await knex("users").where({ email }).first();
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signAccessToken(user);

    res.json({ token });
  } catch (err) {
    console.error("Error logging in:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/auth/me  (update email/password на логнатия потребител)
exports.updateUser = async (req, res) => {
  const userId = req.user.id;
  const { email, password } = req.body;

  try {
    const updateData = {};

    if (email) updateData.email = email;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    const [updatedUser] = await knex("users")
      .where({ id: userId })
      .update(updateData)
      .returning(["id", "email", "role"]);

    res.json({ message: "User updated", user: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/auth/me  (изтрива потребителя и неговите събития)
exports.deleteUser = async (req, res) => {
  const userId = req.user.id;

  try {
    await knex("events").where({ user_id: userId }).del(); // delete events
    await knex("users").where({ id: userId }).del(); // delete user

    res.json({ message: "User and their events deleted" });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
