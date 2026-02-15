const expenseModel = require("../models/expense.models");

exports.getAll = async (req, res) => {
    const expenses = await expenseModel.getAll();
    res.json(expenses);
}

