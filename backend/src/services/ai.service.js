const axios = require("axios");

exports.predictCategory = async (description) => {

  const response = await axios.post(
    "http://localhost:8000/predict-category",
    { description }
  );

  return response.data.predicted_category;

};

exports.retrainModel = async () => {

  await axios.post("http://localhost:8000/retrain");

};

exports.analyzeExpenses = async (expenses) => {
  const response = await axios.post("http://localhost:8000/analyze", { expenses });
  return response.data;
};

exports.askQuestion = async (question, expenses) => {
  const response = await axios.post("http://localhost:8000/ask", { question, expenses });
  return response.data;
};

