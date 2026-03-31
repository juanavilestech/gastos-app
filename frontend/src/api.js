import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const getExpenses = async () => {
  try {
    const response = await api.get("/expenses");
    return response.data;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
};

export const createExpense = async (expenseData) => {
  try {
    const response = await api.post("/expenses", expenseData);
    return response.data;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const askAI = async (question) => {
  try {
    const response = await api.post("/ai/ask", { question });
    return response.data;
  } catch (error) {
    console.error("Error asking AI:", error);
    throw error;
  }
};

export const getAIAnalysis = async () => {
  try {
    const response = await api.get("/ai/analyze");
    return response.data;
  } catch (error) {
    console.error("Error fetching AI analysis:", error);
    return null;
  }
};

export const predictCategory = async (description) => {
  try {
    const response = await api.post("/ai/predict-category", { description });
    return response.data;
  } catch (error) {
    console.error("Error predicting category:", error);
    return null;
  }
};

export const retrainAI = async () => {
  try {
    const response = await api.post("/ai/retrain");
    return response.data;
  } catch (error) {
    console.error("Error retraining AI:", error);
    throw error;
  }
};

export default api;
