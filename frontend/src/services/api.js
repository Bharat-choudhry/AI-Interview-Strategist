import axios from 'axios';

// 1. Create a centralized Axios instance
// This uses the environment variable if available, otherwise defaults to production
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://ai-interview-strategist.onrender.com',
    withCredentials: true // keep this true to send cookies as a fallback or for other routes
});

// 2. Add an Interceptor to automatically attach the JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
