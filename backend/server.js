const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

// Зареждане на променливите от .env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Свързване с PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Тестова заявка към базата
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ DB connection error:", err.stack);
  } else {
    console.log("✅ Connected to DB at:", res.rows[0].now);
  }
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));

// Тестов API маршрут
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
