const expenseService = require("../services/expense.service");
const asyncHandler = require("../middlewares/asyncHandler");

exports.findAll = asyncHandler(async (req, res) => {
  const data = await expenseService.findAll();

  res.json(data);
});

exports.findById = asyncHandler(async (req, res) => {
  const data = await expenseService.findById(req.params.id);

  res.json(data);
});

exports.create = asyncHandler(async (req, res) => {
  const data = await expenseService.create(req.body);

  res.status(201).json(data);
});

exports.update = asyncHandler(async (req, res) => {
  const data = await expenseService.update(req.params.id, req.body);

  res.json(data);
});

exports.remove = asyncHandler(async (req, res) => {
  await expenseService.remove(req.params.id);

  res.json({
    message: "Expense deleted",
  });
});

const pool = require("../config/db");
exports.seedDemo = asyncHandler(async (req, res) => {
  const expensesCategories = [
    "Comida",
    "Transporte",
    "Entretenimiento",
    "Salud",
    "Educación",
    "Hogar",
    "Ropa",
    "Otros",
  ];
  const incomeCategories = ["Sueldo", "Venta", "Inversión", "Regalo", "Otros"];
  const expenseDescriptions = [
    "Supermercado",
    "Cena en restaurante",
    "Uber al trabajo",
    "Gasolina",
    "Netflix",
    "Cine",
    "Farmacia",
    "Gimnasio",
    "Libros",
    "Alquiler",
  ];
  const incomeDescriptions = [
    "Salario mensual",
    "Proyecto Freelance",
    "Venta de gadget",
    "Bono trimestral",
    "Dividendos",
  ];

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        amount NUMERIC(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        type VARCHAR(50) DEFAULT 'gasto'
      );
    `);
  } catch (e) {
    console.error("Error creating table", e);
  }

  try {
    await pool.query(
      "ALTER TABLE expenses ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'gasto'",
    );
  } catch (e) {
    // ignorar si falla
  }

  let insertedCount = 0;
  for (let i = 0; i < 100; i++) {
    const isIncome = Math.random() < 0.2;
    const type = isIncome ? "ingreso" : "gasto";
    const categories = isIncome ? incomeCategories : expensesCategories;
    const descriptions = isIncome ? incomeDescriptions : expenseDescriptions;

    const category = categories[Math.floor(Math.random() * categories.length)];
    const description =
      descriptions[Math.floor(Math.random() * descriptions.length)];
    const amount = isIncome
      ? (Math.random() * 5000 + 1000).toFixed(2)
      : (Math.random() * 500 + 10).toFixed(2);

    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Últimos 60 días

    await pool.query(
      "INSERT INTO expenses (amount, category, description, date, type) VALUES ($1, $2, $3, $4, $5)",
      [amount, category, description, date.toISOString().split("T")[0], type],
    );
    insertedCount++;
  }

  res.status(201).json({
    message: `Se insertaron exitosamente ${insertedCount} gastos/ingresos para la demo.`,
  });
});
