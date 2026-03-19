import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export const getExpenses = async () => {
    try {
        const response = await api.get('/expenses');
        return response.data;
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return [];
    }
};

export const createExpense = async (expenseData) => {
    try {
        const response = await api.post('/expenses', expenseData);
        return response.data;
    } catch (error) {
        console.error('Error creating expense:', error);
        throw error;
    }
};

export default api;
