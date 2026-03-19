const aiService = require("../services/ai.service");
const expenseService = require("../services/expense.service");

exports.analyze = async (req, res, next) => {
  try {
    const expenses = await expenseService.findAll();

    const result = await aiService.analyzeExpenses(expenses);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
