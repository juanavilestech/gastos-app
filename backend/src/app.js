const express = require("express");
const pool = require("./config/db");
const expenseRoutes = require("./routes/expense.routes");
const categoryRoutes = require("./routes/category.routes");
const errorHandler = require("./middlewares/error.middleware");
const aiRoutes = require("./routes/ai.routes");
const authRoutes = require("./routes/auth.routes");
const authMiddleware = require("./middlewares/auth.middleware");

const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "database error" });
  }
});

app.use("/auth", authRoutes);
app.use("/expenses", authMiddleware, expenseRoutes);
app.use("/categories", authMiddleware, categoryRoutes);
app.use("/ai", authMiddleware, aiRoutes);

app.use(errorHandler);

module.exports = app;
