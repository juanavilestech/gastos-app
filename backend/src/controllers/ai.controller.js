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

exports.predictCategory = async (req, res, next) => {
  try {
    const { description } = req.body;
    const predictedCategory = await aiService.predictCategory(description);
    res.json({ description, predicted_category: predictedCategory });
  } catch (error) {
    next(error);
  }
};

exports.retrain = async (req, res, next) => {
  try {
    await aiService.retrainModel();
    res.json({ status: "success", message: "model retrained" });
  } catch (error) {
    next(error);
  }
};
