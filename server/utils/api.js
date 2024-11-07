import axios from 'axios';

// Set the base URL for the backend API
const api = axios.create({
    baseURL: 'http://localhost:3001/api', // Adjust the baseURL to match your Express server's address
    timeout: 10000, // Set a timeout for requests
});

// Example function to get users
export const fetchUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

// Example function to create a new user
export const createUser = async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
};

// Add more functions as needed
export default api;
