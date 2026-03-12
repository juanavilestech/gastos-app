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

