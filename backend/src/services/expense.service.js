const Expense = require("../models/expense.model");
const AppError = require("../utils/AppError");
const { expenseSchema } = require("../schemas/expense.schema");
const aiService = require("./ai.service");

exports.findAll = async () => {
  const expenses = await Expense.findAll();

  return expenses;
};

exports.findById = async (id) => {
  const expense = await Expense.findById(id);

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  return expense;
};

exports.create = async (data) => {
  // Validar con Zod
  const validatedData = expenseSchema.parse(data);

  let category = validatedData.category;

  // Si no viene categoría pero sí descripción → usar IA
  if (!category && validatedData.description) {
    try {
      category = await aiService.predictCategory(validatedData.description);
    } catch (error) {
      console.error("AI prediction failed:", error.message);
    }
  }

  const newExpense = await Expense.create({
    ...validatedData,
    category: category || "Otros",
  });

  // Reentrenar modelo después de guardar
  try {
    await aiService.retrainModel();
  } catch (error) {
    console.error("AI retrain failed:", error.message);
  }

  return newExpense;
};

exports.update = async (id, data) => {
  // Validar con Zod
  const validatedData = expenseSchema.parse(data);

  const existingExpense = await Expense.findById(id);

  if (!existingExpense) {
    throw new AppError("Expense not found", 404);
  }

  const updatedExpense = await Expense.update(id, validatedData);

  return updatedExpense;
};

exports.remove = async (id) => {
  const existingExpense = await Expense.findById(id);

  if (!existingExpense) {
    throw new AppError("Expense not found", 404);
  }

  await Expense.remove(id);

  return true;
};
