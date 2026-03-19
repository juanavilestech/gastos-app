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
