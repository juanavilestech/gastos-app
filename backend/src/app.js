const express = require("express");
const pool = require("./config/db");
const expenseRoutes = require("./routes/expense.routes")

const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/test-db", async (req, res)=>{
    try {
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error: "database error"});
    }
});

app.use("/expenses", expenseRoutes);

module.exports = app;

