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

exports.ask = async (req, res, next) => {
  try {
    const { question } = req.body;
    const expenses = await expenseService.findAll();

    const result = await aiService.askQuestion(question, expenses);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
